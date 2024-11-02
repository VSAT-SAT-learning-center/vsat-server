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
} from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { RecommendationService } from '../recommendation-service/recommendation-service.service';
import { QuizAttemptAnswerService } from '../quiz-attempt-answer/quiz-attempt-answer.service';
import { QuizService } from '../quiz/quiz.service';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';

@ApiTags('QuizAttempts')
@Controller('quiz-attempts')
export class QuizAttemptController extends BaseController<QuizAttempt> {
    constructor(
        private readonly quizAttemptService: QuizAttemptService,
        private readonly quizAttemptAnswerService: QuizAttemptAnswerService,
        private readonly recommendationService: RecommendationService,
        private readonly quizService: QuizService,
        private readonly quizQuestionItemService: QuizQuestionItemService,
    ) {
        super(quizAttemptService, 'QuizAttempt');
    }

    @Post(':unitId/start')
    async startQuizAttempt(
        @Param('unitId') unitId: string,
        @Body() { studyProfileId }: { studyProfileId: string },
    ) {
        // Step 1: Create the quiz based on the unit ID and retrieve the generated quiz
        const quiz = await this.quizService.createQuiz(unitId);

        // Step 2: Start a new quiz attempt for the study profile and associate it with the quiz
        const quizAttempt = await this.quizAttemptService.startQuizAttempt(
            studyProfileId,
            quiz.id,
        );

        // Step 3: Retrieve all quiz questions and answers for the quiz to send to the frontend
        const quizQuestions =
            await this.quizQuestionItemService.getQuizQuestionsWithAnswers(
                quiz.id,
            );

        // Prepare response data to send quiz details and questions with answers for rendering
        return ResponseHelper.success(
            HttpStatus.OK,
            {
                quizAttemptId: quizAttempt.id,
                quizId: quiz.id,
                totalQuestions: quiz.totalquestion,
                questions: quizQuestions, // Each question includes its answers and correct answer status if needed
            },
            'Quiz started successfully',
        );
    }

    @Post(':quizAttemptId/answer')
    async submitAnswer(
        @Param('quizAttemptId') quizAttemptId: string,
        @Body() answerDto: { quizQuestionId: string; isCorrect: boolean },
    ) {
        const { quizQuestionId, isCorrect } = answerDto;
        return await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
            quizAttemptId,
            quizQuestionId,
            isCorrect,
        );
    }

    @Post(':quizAttemptId/complete')
    async completeQuizAttempt(@Param('quizAttemptId') quizAttemptId: string) {
        return await this.quizAttemptService.completeQuizAttempt(quizAttemptId);
    }

    @Get(':quizAttemptId/recommendations')
    async getRecommendations(@Param('quizAttemptId') quizAttemptId: string) {
        return await this.recommendationService.recommendUnitAreas(
            quizAttemptId,
        );
    }
}
