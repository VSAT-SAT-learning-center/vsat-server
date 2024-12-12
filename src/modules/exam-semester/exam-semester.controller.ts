import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Request,
    UseGuards,
} from '@nestjs/common';
import { ExamSemesterService } from './exam-semester.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExamSemesterWithDetailsDto } from './dto/exam-semester.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import {
    UpdateDomainDistributionConfigDto,
    UpdateExamSemesterDto,
} from './dto/update-examsemester.dto';
import {
    UploadFileDomainDistributionConfigDto,
    UploadFileExamSemesterDto,
} from './dto/uploadfile-examsemester.dto';
import { CreateExamSemeseterDto } from './dto/create-examsemester.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { RoleGuard } from 'src/common/guards/role.guard';

@ApiTags('Exam Semesters')
@Controller('exam-semester')
@UseGuards(JwtAuthGuard, new RoleGuard(['staff', 'manager']))
export class ExamSemesterController {
    constructor(private readonly examSemesterService: ExamSemesterService) {}

    @Get('/details')
    async getExamSemestersWithDetails() {
        try {
            const examSemesterList =
                await this.examSemesterService.getExamSemestersWithDetails();

            return ResponseHelper.success(
                HttpStatus.OK,
                examSemesterList,
                SuccessMessages.gets('ExamSemester'),
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

    @Get('/getExamSemestersWithDetailsByCreateBy')
    @UseGuards(JwtAuthGuard)
    async getExamSemestersWithDetailsByCreateBy(@Request() req) {
        try {
            const examSemesterList =
                await this.examSemesterService.getExamSemestersWithDetailsByCreateBy(
                    req.user.id,
                );

            return ResponseHelper.success(
                HttpStatus.OK,
                examSemesterList,
                SuccessMessages.gets('ExamSemester'),
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

    @Get('/:id/details')
    async getExamSemesterById(@Param('id', ParseUUIDPipe) id: string) {
        try {
            const examSemester = await this.examSemesterService.getExamSemesterById(id);

            return ResponseHelper.success(
                HttpStatus.OK,
                examSemester,
                SuccessMessages.get('ExamSemester'),
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

    @Post('import-file')
    @ApiBody({ type: UploadFileExamSemesterDto })
    async importExamSemesterWithConfigs(
        @Body() createExamSemester: UploadFileExamSemesterDto,
    ) {
        const { domainDistributionConfig } = createExamSemester;
        try {
            const result = await this.examSemesterService.uploadExamSemesterWithConfigs(
                domainDistributionConfig,
                createExamSemester,
            );

            return ResponseHelper.success(
                HttpStatus.CREATED,
                result,
                SuccessMessages.create('ExamSemester with DomainDistributionConfigs'),
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

    @Put('updateExamSemester/:id')
    async updateExamSemester(
        @Param('id') id: string,
        @Body() updateExamSemesterDto: UpdateExamSemesterDto,
        @Body('configs')
        updateDomainDistributionConfigDtoArray: UpdateDomainDistributionConfigDto[],
    ) {
        try {
            const updatedSemester =
                await this.examSemesterService.updateExamSemesterWithConfigs(
                    id,
                    updateExamSemesterDto,
                    updateDomainDistributionConfigDtoArray,
                );

            return ResponseHelper.success(
                HttpStatus.OK,
                updatedSemester,
                SuccessMessages.update('ExamSemester with DomainDistributionConfigs'),
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
    async create(@Body() createExamSemeseterDto: CreateExamSemeseterDto) {
        try {
            const savedExamScore =
                await this.examSemesterService.createExamSemesterWithConfigs(
                    createExamSemeseterDto,
                );
            return ResponseHelper.success(
                HttpStatus.OK,
                savedExamScore,
                SuccessMessages.create('CreateExamSemeseter'),
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
