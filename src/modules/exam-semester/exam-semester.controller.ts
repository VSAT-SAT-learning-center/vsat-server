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
} from '@nestjs/common';
import { ExamSemesterService } from './exam-semester.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExamSemesterWithDetailsDto } from './dto/exam-semester.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import {
    CreateDomainDistributionConfigDto,
    CreateExamSemesterDto,
} from './dto/uploadfile-examsemester.dto';
import { UpdateDomainDistributionConfigDto, UpdateExamSemesterDto } from './dto/update-examsemester.dto';

@ApiTags('Exam Semesters')
@Controller('exam-semester')
export class ExamSemesterController {
    constructor(private readonly examSemesterService: ExamSemesterService) {}

    @Get('/details')
    async getExamSemestersWithDetails() {
        try {
            const examSemesterList = await this.examSemesterService.getExamSemestersWithDetails();

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
    @ApiBody({ type: [CreateDomainDistributionConfigDto] })
    async importExamSemesterWithConfigs(
        @Body('configs')
        createDomainDistributionConfigDtoArray: CreateDomainDistributionConfigDto[],
        @Body('examSemester') createExamSemester: CreateExamSemesterDto,
    ) {
        try {
            const result = await this.examSemesterService.uploadExamSemesterWithConfigs(
                createDomainDistributionConfigDtoArray,
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

    @Post()
    async saveManual(
        @Body() createExamSemesterDto: CreateExamSemesterDto,
        @Body('configs')
        createDomainDistributionConfigDtoArray: CreateDomainDistributionConfigDto[],
    ) {
        try {
            const savedExamSemester = await this.examSemesterService.saveExamSemesterWithConfigs(
                createExamSemesterDto,
                createDomainDistributionConfigDtoArray,
            );

            return ResponseHelper.success(
                HttpStatus.CREATED,
                savedExamSemester,
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
            const updatedSemester = await this.examSemesterService.updateExamSemesterWithConfigs(
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
}
