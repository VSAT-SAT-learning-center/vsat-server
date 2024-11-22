import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttempt } from 'src/database/entities/quizattempt.entity';
import { BaseService } from '../base/base.service';
import { QuizService } from '../quiz/quiz.service';
import { Skill } from 'src/database/entities/skill.entity';
import { QuizAttemptStatus } from 'src/common/enums/quiz-attempt-status.enum';
import { QuizAttemptAnswerService } from '../quiz-attempt-answer/quiz-attempt-answer.service';
import { QuizQuestionService } from '../quizquestion/quiz-question.service';
import { CompleteQuizAttemptDto } from './dto/complete-quiz-attempt.dto';
import { CompleteQuizAttemptResponseDto } from './dto/reponse-complete-quiz-attempt.dto';
import { QuizQuestionItemService } from '../quiz-question-item/quiz-question-item.service';
import { ResetQuizAttemptProgressDto } from './dto/reset-quiz-attempt.dto';
import { SkillDto } from 'src/common/dto/common.dto';

@Injectable()
export class QuizAttemptService extends BaseService<QuizAttempt> {
    constructor(
        @InjectRepository(QuizAttempt)
        private readonly quizAttemptRepository: Repository<QuizAttempt>,
        private readonly quizService: QuizService,
        private readonly quizAttemptAnswerService: QuizAttemptAnswerService,
        private readonly quizQuestionService: QuizQuestionService,
        private readonly quizQuestionItemService: QuizQuestionItemService,
    ) {
        super(quizAttemptRepository);
    }

    async startQuizAttempt(unitProgressId: string, quizId: string): Promise<QuizAttempt> {
        const newAttempt = this.quizAttemptRepository.create({
            unitProgress: { id: unitProgressId },
            quiz: { id: quizId },
            attemptdatetime: new Date(),
            status: QuizAttemptStatus.IN_PROGRESS,
        });

        return await this.quizAttemptRepository.save(newAttempt);
    }

    async saveQuizAttemptProgress(
        quizAttemptId: string,
        questionId: string,
        studentAnswerId: string,
        studentAnswerText: string,
    ): Promise<void> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
        });

        if (!quizAttempt) {
            throw new NotFoundException(`QuizAttempt with ID ${quizAttemptId} not found`);
        }

        const isCorrect = await this.quizQuestionService.verifyAnswer(
            questionId,
            studentAnswerId,
            studentAnswerText,
        );

        const existingAnswer = await this.quizAttemptAnswerService.findAnswer(
            quizAttemptId,
            questionId,
        );

        if (existingAnswer) {
            if (studentAnswerText) {
                existingAnswer.studentAnswerText = studentAnswerText;
            } else {
                existingAnswer.studentAnswerId = studentAnswerId;
            }

            existingAnswer.isCorrect = isCorrect;
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(existingAnswer);
        } else {
            await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
                quizAttemptId,
                questionId,
                studentAnswerId,
                studentAnswerText,
                isCorrect,
            );
        }

        await this.updateProgress(quizAttemptId, {
            status: QuizAttemptStatus.IN_PROGRESS,
        });
    }

    async skipQuizAttemptProgress(
        quizAttemptId: string,
        questionId: string,
    ): Promise<void> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
        });

        if (!quizAttempt) {
            throw new NotFoundException(`QuizAttempt with ID ${quizAttemptId} not found`);
        }

        const existingAnswer = await this.quizAttemptAnswerService.findAnswer(
            quizAttemptId,
            questionId,
        );

        if (existingAnswer) {
            existingAnswer.studentAnswerId = null;
            existingAnswer.studentAnswerText = null;
            existingAnswer.isCorrect = false;
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(existingAnswer);
        } else {
            await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
                quizAttemptId,
                questionId,
                null,
                null,
                false,
            );
        }

        await this.updateProgress(quizAttemptId, {
            status: QuizAttemptStatus.IN_PROGRESS,
        });
    }

    async completeQuizAttempt(
        quizId: string,
        completeQuizAttemptDto: CompleteQuizAttemptDto,
    ): Promise<CompleteQuizAttemptResponseDto> {
        const { unitProgressId } = completeQuizAttemptDto;

        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: {
                quiz: { id: quizId },
                unitProgress: { id: unitProgressId },
                status: QuizAttemptStatus.IN_PROGRESS,
            },
            relations: ['answers', 'answers.quizQuestion'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Ongoing Quiz Attempt not found for Quiz ID ${quizId}`,
            );
        }

        let correctAnswers = 0;
        const totalQuestions = quizAttempt.answers.length;

        for (const answer of quizAttempt.answers) {
            const isCorrect = await this.quizQuestionService.verifyAnswer(
                answer.quizQuestion.id,
                answer.studentAnswerId,
                answer.studentAnswerText,
            );

            answer.isCorrect = isCorrect;
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(answer);

            if (isCorrect) correctAnswers++;
        }

        const score = (correctAnswers / totalQuestions) * 100;

        quizAttempt.score = Math.round(score);
        quizAttempt.status = QuizAttemptStatus.COMPLETED;
        quizAttempt.attemptdatetime = new Date();
        const savedQuizAttempt = await this.quizAttemptRepository.save(quizAttempt);

        const skillsResult = await this.assessSkillProgress(savedQuizAttempt.id);

        const recommendedUnits = await this.findWeakSkillsByQuizAttempt(
            savedQuizAttempt.id,
        );

        const progressEvaluation = await this.evaluateQuizProgress(
            unitProgressId,
            quizId,
            score,
        );

        const courseMastery = await this.calculateCourseMastery(unitProgressId);

        const currentUnit = await this.quizService.getCurrentUnitForQuiz(quizId);

        return {
            // The student score
            currentScore: score,
            // Độ thành thạo của học sinh qua các bài làm attempt
            courseMastery,
            // The unit identifier that the student is currently working on or will move to next.
            currentUnit,
            // Summary of skills assessed in the quiz, detailing accuracy per skill and total correct answers.
            skillsSummary: skillsResult.skillsSummary,
            // Detailed performance metrics for each skill, including accuracy and proficiency level.
            // Will be implement in the future
            skillDetails: skillsResult.skillDetails,
            // A list of recommended units (or unit areas) that focus on skills the student needs to improve.
            recommendedLessons: recommendedUnits,
            // A summary evaluation comparing the student’s performance in this quiz to previous attempts, e.g., improvement, steady, or decline.
            progressEvaluation,
        };
    }

    async findWeakSkillsByQuizAttempt(quizAttemptId: string): Promise<Skill[]> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['answers', 'answers.quizQuestion', 'answers.quizQuestion.skill'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with id ${quizAttemptId} not found`,
            );
        }

        const skillAccuracyMap = new Map<
            string,
            { skill: Skill; correct: number; total: number }
        >();

        for (const answer of quizAttempt.answers) {
            const skillId = answer.quizQuestion.skill.id;
            if (!skillAccuracyMap.has(skillId)) {
                skillAccuracyMap.set(skillId, {
                    skill: answer.quizQuestion.skill,
                    correct: 0,
                    total: 0,
                });
            }
            const skillStats = skillAccuracyMap.get(skillId);
            skillStats.total += 1;
            if (answer.isCorrect) {
                skillStats.correct += 1;
            }
        }

        const weakSkills: Skill[] = [];
        for (const { skill, correct, total } of skillAccuracyMap.values()) {
            const accuracy = (correct / total) * 100;
            if (accuracy < 70) {
                weakSkills.push(skill);
            }
        }

        return weakSkills;
    }

    private async updateProgress(
        quizAttemptId: string,
        updateData: { status: QuizAttemptStatus },
    ): Promise<QuizAttempt> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
        });

        if (!quizAttempt) {
            throw new NotFoundException('Quiz attempt not found');
        }

        quizAttempt.status = updateData.status;

        await this.quizAttemptRepository.save(quizAttempt);

        return quizAttempt;
    }

    private async assessSkillProgress(
        quizAttemptId: string,
    ): Promise<{ skillsSummary: any; skillDetails: any }> {
        const answers =
            await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);
        const skillScores = new Map<SkillDto, { correct: number; total: number }>();

        for (const answer of answers) {
            const skill = {
                id: answer.quizQuestion.skill.id,
                content: answer.quizQuestion.skill.content,
            };
            if (!skillScores.has(skill)) {
                skillScores.set(skill, { correct: 0, total: 0 });
            }

            const skillScore = skillScores.get(skill);
            skillScore.total += 1;
            if (answer.isCorrect) skillScore.correct += 1;
        }

        const currentSkillsSummary = Array.from(skillScores.entries()).map(
            ([skill, score]) => ({
                skill,
                currentAccuracy: (score.correct / score.total) * 100,
            }),
        );

        const previousAttempt = await this.getPreviousAttempt(quizAttemptId);
        let previousSkillsSummary = [];

        if (previousAttempt) {
            const previousAnswers =
                await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(
                    previousAttempt.id,
                );

            const previousSkillScores = new Map<
                string,
                { correct: number; total: number }
            >();

            for (const answer of previousAnswers) {
                const skillId = answer.quizQuestion.skill.id;
                if (!previousSkillScores.has(skillId)) {
                    previousSkillScores.set(skillId, { correct: 0, total: 0 });
                }

                const skillScore = previousSkillScores.get(skillId);
                skillScore.total += 1;
                if (answer.isCorrect) skillScore.correct += 1;
            }

            previousSkillsSummary = Array.from(previousSkillScores.entries()).map(
                ([skillId, score]) => ({
                    skillId,
                    previousAccuracy: (score.correct / score.total) * 100,
                }),
            );
        }

        const skillsSummary = currentSkillsSummary.map((current) => {
            const previous = previousSkillsSummary.find(
                (p) => p.skillId === current.skill.id,
            );
            return {
                ...current,
                previousAccuracy: previous ? previous.previousAccuracy : null,
                improvement: previous
                    ? current.currentAccuracy - previous.previousAccuracy
                    : null,
            };
        });

        return { skillsSummary, skillDetails: skillsSummary };
    }

    private async calculateCourseMastery(unitProgressId: string): Promise<number> {
        const completedAttempts = await this.quizAttemptRepository.find({
            where: {
                unitProgress: { id: unitProgressId },
                status: QuizAttemptStatus.COMPLETED,
            },
        });

        if (completedAttempts.length === 0) return 0;

        const totalScore = completedAttempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0,
        );
        return totalScore / completedAttempts.length;
    }

    private async evaluateQuizProgress(
        unitProgressId: string,
        quizId: string,
        currentScore: number,
    ): Promise<{
        progress: 'improved' | 'declined' | 'same';
        previousScore: number | null;
    }> {
        const previousAttempt = await this.quizAttemptRepository.findOne({
            where: {
                unitProgress: { id: unitProgressId },
                quiz: { id: quizId },
                status: QuizAttemptStatus.COMPLETED,
            },
            order: { attemptdatetime: 'DESC' },
        });

        if (!previousAttempt) {
            return { progress: 'same', previousScore: null };
        }

        const previousScore = previousAttempt.score;

        let progress: 'improved' | 'declined' | 'same';
        if (currentScore > previousScore) {
            progress = 'improved';
        } else if (currentScore < previousScore) {
            progress = 'declined';
        } else {
            progress = 'same';
        }

        return { progress, previousScore };
    }

    async getOngoingQuizAttemptForUnit(
        unitProgressId: string,
        unitId: string,
    ): Promise<QuizAttempt | null> {
        const ongoingQuizAttempt = await this.quizAttemptRepository.findOne({
            where: {
                unitProgress: { id: unitProgressId },
                quiz: { unit: { id: unitId } },
                status: QuizAttemptStatus.IN_PROGRESS,
            },
            relations: [
                'quiz',
                'quiz.quizQuestions',
                'quiz.quizQuestions.quizquestion',
                'quiz.unit',
            ],
            order: {
                attemptdatetime: 'DESC',
            },
        });

        return ongoingQuizAttempt || null;
    }

    async findByQuizId(quizId: string): Promise<QuizAttempt | null> {
        return this.quizAttemptRepository.findOne({
            where: {
                quiz: { id: quizId },
                status: QuizAttemptStatus.IN_PROGRESS,
            },
            relations: ['quiz', 'unitProgress'],
        });
    }

    async validateCompletion(quizAttemptId: string): Promise<boolean> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['quiz', 'quiz.quizQuestions'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with ID ${quizAttemptId} not found.`,
            );
        }

        const answeredQuestions =
            await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);

        const answerQuestionCount = answeredQuestions.length;

        const totalQuestions = quizAttempt.quiz.quizQuestions.length;

        return answerQuestionCount === totalQuestions;
    }

    async getQuizAttemptStatus(quizAttemptId: string): Promise<any> {
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['quiz', 'quiz.quizQuestions'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with ID ${quizAttemptId} not found`,
            );
        }

        const answeredQuestions =
            await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);

        const totalQuestions = quizAttempt.quiz.quizQuestions.length;
        const answeredCount = answeredQuestions.length;
        const progressPercentage = (answeredCount / totalQuestions) * 100;
        const status = quizAttempt.status;

        return {
            quizAttemptId: quizAttempt.id,
            status,
            progress: {
                totalQuestions,
                answeredQuestions: answeredCount,
                progressPercentage,
                questionsAnswered: answeredQuestions.map((a) => ({
                    questionId: a.quizQuestion.id,
                    studentAnswerId: a.studentAnswerId,
                    studentAnswerText: a.studentAnswerText,
                    isCorrect: a.isCorrect,
                })),
            },
        };
    }

    async getPreviousAttempt(currentQuizAttemptId: string): Promise<QuizAttempt | null> {
        const currentAttempt = await this.quizAttemptRepository.findOne({
            where: { id: currentQuizAttemptId },
            relations: ['quiz', 'unitProgress'],
        });

        if (!currentAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with ID ${currentQuizAttemptId} not found`,
            );
        }

        const previousAttempt = await this.quizAttemptRepository.findOne({
            where: {
                quiz: { id: currentAttempt.quiz.id },
                unitProgress: { id: currentAttempt.unitProgress.id },
                status: QuizAttemptStatus.COMPLETED,
            },
            order: { attemptdatetime: 'DESC' },
        });

        return previousAttempt || null;
    }

    async resetQuizAttempt(resetQuizAttempt: ResetQuizAttemptProgressDto): Promise<any> {
        const { quizAttemptId, unitProgressId, unitId } = resetQuizAttempt;

        let ongoingAttempt;

        if (!quizAttemptId) {
            ongoingAttempt = await this.getOngoingQuizAttemptForUnit(
                unitProgressId,
                unitId,
            );

            if (!ongoingAttempt) {
                throw new NotFoundException('No ongoing quiz attempt found to reset.');
            }
        } else {
            ongoingAttempt = await this.quizAttemptRepository.findOne({
                where: { id: quizAttemptId },
            });

            if (!ongoingAttempt) {
                throw new NotFoundException(
                    `Quiz attempt with ID ${quizAttemptId} not found.`,
                );
            }
        }

        ongoingAttempt.status = QuizAttemptStatus.ABANDONED;
        await this.quizAttemptRepository.save(ongoingAttempt);

        const newQuiz = await this.quizService.createQuiz(unitId);
        const newQuizAttempt = await this.startQuizAttempt(unitProgressId, newQuiz.id);

        const quizQuestions =
            await this.quizQuestionItemService.getQuizQuestionsWithAnswers(newQuiz.id);

        return {
            quizAttemptId: newQuizAttempt.id,
            quizId: newQuiz.id,
            totalQuestions: newQuiz.totalquestion,
            questions: quizQuestions,
        };
    }
}
