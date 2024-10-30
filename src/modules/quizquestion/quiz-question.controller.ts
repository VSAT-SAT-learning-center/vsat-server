import { Body, Controller, HttpException, HttpStatus, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseController } from "../base/base.controller";
import { QuizQuestion } from "src/database/entities/quizquestion.entity";
import { QuizQuestionService } from "./quiz-question.service";
import { CreateQuizQuestionDto } from "./dto/create-quiz.dto";
import { ResponseHelper } from "src/common/helpers/response.helper";
import { SuccessMessages } from "src/common/constants/success-messages";

@ApiTags('QuizQuestions')
@Controller('quiz-questions')
export class QuizQuestionController{
  constructor(
    private readonly quizQuestionService: QuizQuestionService) {}

    @Post()
    async saveManual(@Body() createQuizQuestionDto: CreateQuizQuestionDto) {
        try {
            const saveQuestion =
                await this.quizQuestionService.saveQuizQuestion(createQuizQuestionDto);
            return ResponseHelper.success(
                HttpStatus.CREATED,
                saveQuestion,
                SuccessMessages.create('QuizQuestion'),
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