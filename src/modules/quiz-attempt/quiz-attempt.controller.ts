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
} from '@nestjs/common';
import { CreateQuizAttemptDto } from './dto/create-quizattempt.dto';
import { UpdateQuizAttemptDto } from './dto/update-quizattempt.dto';
import { QuizAttemptService } from './quiz-attempt.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { BaseController } from '../base/base.controller';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from '../recommendation-service/recommendation.service';
import { QuizAttemptAnswerService } from '../quiz-attempt-answer/quiz-attempt-answer.service';
import { QuizService } from '../quiz/quiz.service';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { SaveQuizAttemptProgressDto } from './dto/save-quiz-attempt.dto';
import { CompleteQuizAttemptResponseDto } from './dto/reponse-complete-quiz-attempt.dto';
import { QuizAttemptStatus } from 'src/common/enums/quiz-attempt-status.enum';

@ApiTags('QuizAttempts')
@Controller('quiz-attempts')
export class QuizAttemptController extends BaseController<QuizAttempt> {
    constructor(
        private readonly quizAttemptService: QuizAttemptService,
        private readonly recommendationService: RecommendationService,
        private readonly quizService: QuizService,
        private readonly quizQuestionItemService: QuizQuestionItemService,
    ) {
        super(quizAttemptService, 'QuizAttempt');
    }

    @Post(':unitId/start')
    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            studyProfileId: { type: 'string', description: 'ID of the study profile' },
          },
          required: ['studyProfileId'],
        },
      })
    async startQuizAttempt(
        @Param('unitId') unitId: string,
        @Body() { studyProfileId }: { studyProfileId: string },
    ) {
        // Step 1: Check if there's an ongoing quiz attempt for this unit and study profile
        let quizAttempt =
            await this.quizAttemptService.getOngoingQuizAttemptForUnit(
                studyProfileId,
                unitId,
            );

        let quiz;
        if (quizAttempt) {
            // Step 2: If there's an ongoing attempt, retrieve the quiz from the attempt
            quiz = quizAttempt.quiz;
        } else {
            // Step 3: No ongoing attempt found, so create a new quiz and start a new attempt
            quiz = await this.quizService.createQuiz(unitId);
            quizAttempt = await this.quizAttemptService.startQuizAttempt(
                studyProfileId,
                quiz.id,
            );
        }

        // Step 4: Retrieve quiz questions with answers to send to the frontend
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
                questions: quizQuestions, // Includes answers and correct status if needed
            },
            quizAttempt.status === QuizAttemptStatus.IN_PROGRESS
                ? 'Quiz resumed successfully'
                : 'Quiz started successfully',
        );
    }

    /**
     * Save the student's answer for a question as they progress through the quiz.
     */
    @Post(':quizAttemptId/progress')
    async saveQuizAttemptProgress(
        @Param('quizAttemptId') quizAttemptId: string,
        @Body() saveQuizAttemptProgressDto: SaveQuizAttemptProgressDto,
    ) {
        const { questionId, selectedAnswerId } = saveQuizAttemptProgressDto;
        try {
            const quizAttempt =
                await this.quizAttemptService.findOneById(quizAttemptId);
            if (
                !quizAttempt ||
                quizAttempt.status !== QuizAttemptStatus.IN_PROGRESS
            ) {
                throw new HttpException(
                    'Quiz attempt is not in progress or does not exist.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Save progress
            await this.quizAttemptService.saveQuizAttemptProgress(
                quizAttemptId,
                questionId,
                selectedAnswerId,
            );

            // // Return the current progress of the quiz attempt
            // const progress =
            //     await this.quizAttemptService.getProgress(quizAttemptId);
            return {
                message: 'Progress saved successfully',
                //progress,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Complete the quiz attempt, calculate the score, and get the quiz results.
     */
    @Post(':quizId/complete')
    async completeQuizAttempt(
        @Param('quizId') quizId: string,
        @Body() completeQuizAttemptDto: CompleteQuizAttemptDto,
    ) {
        try {
            // Ensure the quiz attempt is in progress
            const quizAttempt =
                await this.quizAttemptService.findByQuizId(quizId);
            if (
                !quizAttempt ||
                quizAttempt.status !== QuizAttemptStatus.IN_PROGRESS
            ) {
                throw new HttpException(
                    'Quiz attempt is not in progress or does not exist.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Validate if all questions are answered
            const allQuestionsAnswered =
                await this.quizAttemptService.validateCompletion(
                    quizAttempt.id,
                );
            if (!allQuestionsAnswered) {
                throw new HttpException(
                    'All questions must be answered before completing the quiz.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Complete the quiz and calculate results
            const results = await this.quizAttemptService.completeQuizAttempt(
                quizId,
                completeQuizAttemptDto,
            );

            // Return a detailed response
            return {
                ...results,
                message: 'Quiz completed successfully',
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':quizAttemptId/recommendations')
    async getRecommendations(@Param('quizAttemptId') quizAttemptId: string) {
        return await this.recommendationService.recommendUnitAreas(
            quizAttemptId,
        );
    }
}
