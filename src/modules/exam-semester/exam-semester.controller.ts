import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ExamSemesterService } from './exam-semester.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExamSemesterWithDetailsDto } from './dto/exam-semester.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';

@ApiTags('Exam Semesters')
@Controller('exam-semester')
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

    @Get('/:id/details')
    async getExamSemesterById(@Param('id', ParseUUIDPipe) id: string) {
        try {
            const examSemester =
                await this.examSemesterService.getExamSemesterById(id);

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
}
