import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BaseController } from "../base/base.controller";
import { QuizQuestion } from "src/database/entities/quizquestion.entity";
import { QuizQuestionService } from "./quiz-question.service";

@ApiTags('QuizQuestions')
@Controller('quiz-questions')
export class QuizQuestionController extends BaseController<QuizQuestion> {
  constructor(quizQuestionService: QuizQuestionService) {
    super(quizQuestionService, 'QuizQuestion');
  }
}