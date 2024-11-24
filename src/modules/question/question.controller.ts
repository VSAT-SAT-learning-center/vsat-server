import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { QuestionService } from './question.service';
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { CreateQuestionFileDto } from './dto/create-question-file.dto';
import { QuestionFeedbackDto } from '../feedback/dto/question-feedback.dto';
import { FetchByContentDTO } from './dto/fetch-question.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Questions')
@Controller('questions')
@ApiBearerAuth('JWT-auth')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Post('import-file')
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    @ApiBody({ type: [CreateQuestionFileDto] })
    async save(@Body() createQuestionDto: CreateQuestionFileDto[]) {
        try {
            const saveQuestion = await this.questionService.save(createQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post()
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async saveManual(@Body() createQuestionDto: CreateQuestionDTO) {
        try {
            const saveQuestion = await this.questionService.saveManual(createQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get()
    //@UseGuards(JwtAuthGuard)
    async getAllWithStatus(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('status') status?: QuestionStatus,
    ) {
        try {
            const questions = await this.questionService.getAllWithStatus(
                page,
                pageSize,
                status,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('getAllWithStatusByCreateBy')
    @UseGuards(JwtAuthGuard)
    async getAllWithStatusByCreateBy(
        @Request() req,
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
        @Query('status') status?: QuestionStatus,
    ) {
        try {
            const questions = await this.questionService.getAllWithStatusByCreateBy(
                page,
                pageSize,
                status,
                req.user.id,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('searchQuestions/:plainContent')
    async searchQuestions(
        @Query('page') page: number = 1,
        @Query('pageSize') pageSize: number = 10,
        @Query('skillId') skillId?: string,
        @Query('domain') domain?: string,
        @Query('level') level?: string,
        @Param('plainContent') plainContent?: string,
    ) {
        try {
            const questions = await this.questionService.searchQuestions(
                page,
                pageSize,
                skillId,
                domain,
                level,
                plainContent,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put('update-status/:id')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    enum: ['Submit', 'Reject', 'Approved'],
                },
            },
        },
    })
    async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        try {
            const { status } = body;
            const checkQuestion = await this.questionService.updateStatus(
                id,
                status as QuestionStatus,
            );

            if (checkQuestion) {
                return ResponseHelper.success(HttpStatus.OK, SuccessMessages.approve());
            }
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Put('updateQuestion/:id')
    async updateQuestion(
        @Param('id') id: string,
        @Body() updateQuestionDto: UpdateQuestionDTO,
    ) {
        try {
            const question = await this.questionService.updateQuestion(
                id,
                updateQuestionDto,
            );
            return ResponseHelper.success(
                HttpStatus.OK,
                question,
                SuccessMessages.update('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Get('get-question-with-answer')
    async getQuestionWithAnswer(
        @Query('page') page?: number,
        @Query('pageSize') pageSize?: number,
    ) {
        try {
            const questions = await this.questionService.getQuestionWithAnswer(
                page,
                pageSize,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                questions,
                SuccessMessages.get('Question'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Patch('publish')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                questionIds: { type: 'array', items: { type: 'string' } },
            },
        },
    })
    @UseGuards(JwtAuthGuard, new RoleGuard(['staff']))
    async publishQuestions(@Body() body: { questionIds: string[] }) {
        try {
            const { questionIds } = body;

            await this.questionService.publish(questionIds);

            return ResponseHelper.success(
                HttpStatus.OK,
                SuccessMessages.update('Questions'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('censor/:action')
    @UseGuards(JwtAuthGuard, new RoleGuard(['manager']))
    async approveOrRejectQuestion(
        @Param('action') action: 'approve' | 'reject',
        @Body() feedbackDto: QuestionFeedbackDto,
    ) {
        if (action !== 'approve' && action !== 'reject') {
            throw new BadRequestException('Invalid action. Use "approve" or "reject".');
        }

        try {
            const feedbacks = await this.questionService.approveOrRejectQuestion(
                feedbackDto,
                action,
            );

            return ResponseHelper.success(
                HttpStatus.OK,
                feedbacks,
                SuccessMessages.update('Feedback'),
            );
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }

    @Post('fetchByContent')
    @ApiBody({ type: FetchByContentDTO })
    async fetchByContent(@Body() fetchByContentDto: FetchByContentDTO) {
        try {
            return await this.questionService.fetchByContent(fetchByContentDto.contents);
        } catch (error) {
            throw new HttpException(
                {
                    statusCode: error.status || HttpStatus.BAD_REQUEST,
                    message: error.message || 'An error occurred',
                },
                error.status || HttpStatus.BAD_REQUEST,
            );
        }
    }
}
