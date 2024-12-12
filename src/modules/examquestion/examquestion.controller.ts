import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Patch,
} from '@nestjs/common';
import { ExamQuestionService } from './examquestion.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/message/success-messages';
import { ApiTags } from '@nestjs/swagger';
import { UpdateExamQuestion } from './dto/update-examquestion.dto';

@ApiTags('ExamQuestions')
@Controller('exam-questions')
export class ExamQuestionController {
    constructor(private readonly examQuestionService: ExamQuestionService) {}

    @Patch()
    async updateExamQuestion(@Body() updateExamQuestion: UpdateExamQuestion) {
        try {
            const examquestion =
                await this.examQuestionService.updateExamQuestion(updateExamQuestion);
            return ResponseHelper.success(
                HttpStatus.OK,
                examquestion,
                SuccessMessages.update('ExamQuestion'),
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
