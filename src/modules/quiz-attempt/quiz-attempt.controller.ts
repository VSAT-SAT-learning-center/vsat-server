import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpException,
    UseGuards,
} from '@nestjs/common';
import { QuizAttemptService } from './quiz-attempt.service';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { BaseController } from '../base/base.controller';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from '../recommendation-service/recommendation.service';
import { QuizService } from '../quiz/quiz.service';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { SaveQuizAttemptProgressDto } from './dto/save-quiz-attempt.dto';
import { QuizAttemptStatus } from 'src/common/enums/quiz-attempt-status.enum';
import { SkipQuizAttemptProgressDto } from './dto/skip-quiz-attempt.dto';
import { ResetQuizAttemptProgressDto } from './dto/reset-quiz-attempt.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@ApiTags('QuizAttempts')
@Controller('quiz-attempts')
@UseGuards(JwtAuthGuard)
export class QuizAttemptController extends BaseController<QuizAttempt> {
    constructor(
        private readonly quizAttemptService: QuizAttemptService,
        private readonly recommendationService: RecommendationService,
        private readonly quizService: QuizService,
        private readonly quizQuestionItemService: QuizQuestionItemService,
    ) {
        super(quizAttemptService, 'QuizAttempt');
    }

    @ApiOperation({
        summary:
            'Step 1: Start a quiz attempt -> need call /quiz-attempts/info after that',
    })
    @Post(':unitId/start')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                unitProgressId: {
                    type: 'string',
                    description: 'ID of the study profile',
                },
            },
            required: ['unitProgressId'],
        },
    })
    async startQuizAttempt(
        @Param('unitId') unitId: string,
        @Body() { unitProgressId }: { unitProgressId: string },
    ) {
        let quizAttempt = await this.quizAttemptService.getOngoingQuizAttemptForUnit(
            unitProgressId,
            unitId,
        );

        let quiz;
        if (quizAttempt) {
            quiz = quizAttempt.quiz;
        } else {
            quiz = await this.quizService.createQuiz(unitId);
            quizAttempt = await this.quizAttemptService.startQuizAttempt(
                unitProgressId,
                quiz.id,
            );
        }

        const quizQuestions =
            await this.quizQuestionItemService.getQuizQuestionsWithAnswers(quiz.id);

        return ResponseHelper.success(
            HttpStatus.OK,
            {
                quizAttemptId: quizAttempt.id,
                quizId: quiz.id,
                totalQuestions: quiz.totalquestion,
                questions: quizQuestions,
            },
            quizAttempt.status === QuizAttemptStatus.IN_PROGRESS
                ? 'Quiz resumed successfully'
                : 'Quiz started successfully',
        );
    }

    @ApiOperation({ summary: 'Student submit answer' })
    @Post(':quizAttemptId/progress')
    async saveQuizAttemptProgress(
        @Param('quizAttemptId') quizAttemptId: string,
        @Body() saveQuizAttemptProgressDto: SaveQuizAttemptProgressDto,
    ) {
        const { questionId, studentdAnswerId, studentdAnswerText } =
            saveQuizAttemptProgressDto;
        try {
            const quizAttempt = await this.quizAttemptService.findOneById(quizAttemptId);
            if (!quizAttempt || quizAttempt.status !== QuizAttemptStatus.IN_PROGRESS) {
                throw new HttpException(
                    'Quiz attempt is not in progress or does not exist.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Save progress
            await this.quizAttemptService.saveQuizAttemptProgress(
                quizAttemptId,
                questionId,
                studentdAnswerId,
                studentdAnswerText,
            );

            return {
                message: 'Progress saved successfully',
                //progress,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiOperation({ summary: 'Student skip question' })
    @Post(':quizAttemptId/skip-progress')
    async skipQuizAttemptProgress(
        @Param('quizAttemptId') quizAttemptId: string,
        @Body() saveQuizAttemptProgressDto: SkipQuizAttemptProgressDto,
    ) {
        const { questionId } = saveQuizAttemptProgressDto;
        try {
            const quizAttempt = await this.quizAttemptService.findOneById(quizAttemptId);
            if (!quizAttempt || quizAttempt.status !== QuizAttemptStatus.IN_PROGRESS) {
                throw new HttpException(
                    'Quiz attempt is not in progress or does not exist.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Save progress
            await this.quizAttemptService.skipQuizAttemptProgress(
                quizAttemptId,
                questionId,
            );

            return {
                message: 'Progress saved successfully',
                //progress,
            };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiOperation({
        summary:
            'Complete the quiz attempt, calculate the score, and get the quiz results.',
    })
    @Post(':quizId/complete')
    async completeQuizAttempt(
        @Param('quizId') quizId: string,
        @Body() completeQuizAttemptDto: CompleteQuizAttemptDto,
    ) {
        try {
            // Ensure the quiz attempt is in progress
            const quizAttempt = await this.quizAttemptService.findByQuizId(quizId);
            if (!quizAttempt || quizAttempt.status !== QuizAttemptStatus.IN_PROGRESS) {
                throw new HttpException(
                    'Quiz attempt is not in progress or does not exist.',
                    HttpStatus.BAD_REQUEST,
                );
            }

            // Validate if all questions are answered
            const allQuestionsAnswered = await this.quizAttemptService.validateCompletion(
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

    @ApiOperation({ summary: 'Reset the quiz' })
    @Post('reset')
    async resetQuizAttempt(@Body() resetQuizAttempt: ResetQuizAttemptProgressDto) {
        try {
            // Reset the quiz attempt
            const newQuizDetails =
                await this.quizAttemptService.resetQuizAttempt(resetQuizAttempt);

            // Respond with new quiz details
            return ResponseHelper.success(
                HttpStatus.OK,
                newQuizDetails,
                'Quiz reset successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @Get(':quizAttemptId/recommendations')
    async getRecommendations(@Param('quizAttemptId') quizAttemptId: string) {
        return await this.recommendationService.recommendUnitAreas(quizAttemptId);
    }

    @ApiOperation({ summary: 'Step 2: Get student quiz attempt infomation' })
    @Get(':quizAttemptId/info')
    async getQuizAttemptInfo(@Param('quizAttemptId') quizAttemptId: string) {
        try {
            const response =
                await this.quizAttemptService.getQuizAttemptStatus(quizAttemptId);
            return ResponseHelper.success(
                HttpStatus.OK,
                response,
                'Quiz attempt status retrieved successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }

    @ApiOperation({ summary: 'Step 2: Get latest student quiz attempt by unitProgress' })
    @Get(':unitProgressId/latest')
    async getQuizAttemptInfoByUnitProgress(
        @Param('unitProgressId') unitProgressId: string,
    ) {
        try {
            const response =
                await this.quizAttemptService.getLatestQuizAttemptStatus(unitProgressId);
            return ResponseHelper.success(
                HttpStatus.OK,
                response,
                'Quiz attempt status retrieved successfully',
            );
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}
