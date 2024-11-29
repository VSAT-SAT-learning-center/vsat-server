import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    Put,
    HttpStatus,
    HttpException,
    Request,
    UseGuards,
} from '@nestjs/common';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { ExamAttemptService } from './exam-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateTargetLearningDto } from '../target-learning/dto/create-targetlearning.dto';
import { SuccessMessages } from 'src/common/message/success-messages';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { AssignExamAttemptDto } from './dto/assign-examattempt.dto';
import { CreateExamWithExamAttemptDto } from '../exam/dto/create-examwithattempt.dto';

@ApiTags('ExamAttempts')
@Controller('exam-attempts')
@ApiBearerAuth('JWT-auth')
export class ExamAttemptController {
    constructor(private readonly examAttemptService: ExamAttemptService) {}

    @Post(':id')
    @UseGuards(JwtAuthGuard)
    async recommend(
        @Param('id') examAttemptId: string,
        @Body() createTargetLearningDto: CreateTargetLearningDto,
        @Request() req,
    ) {
        try {
            const recommend = await this.examAttemptService.recommend(
                examAttemptId,
                createTargetLearningDto,
                req.user.id,
            );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                recommend,
                SuccessMessages.create('Recommend'),
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

    @Get('getExamAtemptDomainRW/:id')
    async getExamAtemptDomainRW(
        @Param('id') id: string,
        @Query('isCorrect') isCorrect: boolean,
    ) {
        try {
            const getExamAtemptDomain =
                await this.examAttemptService.getExamAtemptDomainRW(id, isCorrect);
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptDomain,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAtemptsSkillRW/:id')
    async getExamAtemptsSkillRW(
        @Param('id') id: string,
        @Query('isCorrect') isCorrect: boolean,
    ) {
        try {
            const getExamAtemptSkill =
                await this.examAttemptService.getExamAtemptsSkillRW(id, isCorrect);
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptSkill,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAtemptDomainMath/:id')
    async getExamAtemptDomainMath(
        @Param('id') id: string,
        @Query('isCorrect') isCorrect: boolean,
    ) {
        try {
            const getExamAtemptDomain =
                await this.examAttemptService.getExamAtemptDomainMath(id, isCorrect);
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptDomain,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAtemptsSkillMath/:id')
    async getExamAtemptsSkillMath(
        @Param('id') id: string,
        @Query('isCorrect') isCorrect: boolean,
    ) {
        try {
            const getExamAtemptSkill =
                await this.examAttemptService.getExamAtemptsSkillMath(id, isCorrect);
            return ResponseHelper.success(
                HttpStatus.OK,
                getExamAtemptSkill,
                SuccessMessages.get('ExamAttempt'),
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
    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async createExamAttempt(
        @Body() createExamAttemptDto: CreateExamAttemptDto,
        @Request() req,
    ) {
        try {
            const createExamAttempt = await this.examAttemptService.createExamAttempt(
                createExamAttemptDto,
                req.user.id,
            );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createExamAttempt,
                SuccessMessages.create('ExamAttempt'),
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

    // @Get('getExamAttemptByStudyProfileId')
    // @UseGuards(JwtAuthGuard)
    // async getExamAttemptByStudyProfileId(@Request() req) {
    //     try {
    //         const getExamAtempt =
    //             await this.examAttemptService.getExamAttemptByStudyProfileId(req.user.id);
    //         return ResponseHelper.success(
    //             HttpStatus.OK,
    //             getExamAtempt,
    //             SuccessMessages.get('ExamAttempt'),
    //         );
    //     } catch (error) {
    //         throw new HttpException(
    //             {
    //                 statusCode: error.status || HttpStatus.BAD_REQUEST,
    //                 message: error.message || 'An error occurred',
    //             },
    //             error.status || HttpStatus.BAD_REQUEST,
    //         );
    //     }
    // }

    @Get('statistics/:id')
    async getExamAttemptStatistics(@Param('id') id: string) {
        try {
            const examAttemptStatistics =
                await this.examAttemptService.getExamAttemptStatistics(id);

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttemptStatistics,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAttemptByStudyProfile')
    @UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async getExamAttemptByStudyProfile(@Request() req) {
        try {
            const examAttempt =
                await this.examAttemptService.getExamAttemptByStudyProfile(req.user.id);

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttempt,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getAllExamAttemptByStudyProfile/:studyProfileId')
    //@UseGuards(JwtAuthGuard, new RoleGuard(['student']))
    async getAllExamAttemptByStudyProfile(
        @Param('studyProfileId') studyProfileId: string,
    ) {
        try {
            const examAttempt =
                await this.examAttemptService.getAllExamAttemptByStudyProfile(
                    studyProfileId,
                );

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttempt,
                SuccessMessages.get('ExamAttempt'),
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

    @Post('createExamAttemptWithExam/exam')
    @UseGuards(JwtAuthGuard)
    async createExamAttemptWithExam(
        @Body() createExamAttemptDto: CreateExamWithExamAttemptDto,
    ) {
        try {
            const createExamAttempt =
                await this.examAttemptService.createExamAttemptWithExam(
                    createExamAttemptDto,
                );
            return ResponseHelper.success(
                HttpStatus.CREATED,
                createExamAttempt,
                SuccessMessages.create('ExamAttempt'),
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

    @Get('getExamAttemptWithStudyProfileByTeacher')
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getExamAttemptWithStudyProfileByTeacher(@Request() req) {
        try {
            const examAttempt =
                await this.examAttemptService.getExamAttemptWithStudyProfileByTeacher(
                    req.user.id,
                );

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttempt,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getExamAttemptWithStudyProfileByTeacherAndExam/:examId')
    @UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getExamAttemptWithStudyProfileByTeacherAndExam(
        @Request() req,
        @Param('examId') examId: string,
    ) {
        try {
            const examAttempt =
                await this.examAttemptService.getExamAttemptWithStudyProfileByTeacherAndExam(
                    req.user.id,
                    examId,
                );

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttempt,
                SuccessMessages.get('ExamAttempt'),
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

    @Get('getReport/:examAttemptId')
    //@UseGuards(JwtAuthGuard, new RoleGuard(['teacher']))
    async getReport(@Param('examAttemptId') examId: string) {
        try {
            const examAttempt =
                await this.examAttemptService.getReport(examId);

            return ResponseHelper.success(
                HttpStatus.OK,
                examAttempt,
                SuccessMessages.get('ExamAttempt'),
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
}
