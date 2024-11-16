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

@Injectable()
export class QuizAttemptService extends BaseService<QuizAttempt> {
    constructor(
        @InjectRepository(QuizAttempt)
        private readonly quizAttemptRepository: Repository<QuizAttempt>,
        private readonly quizService: QuizService,
        private readonly quizAttemptAnswerService: QuizAttemptAnswerService,
        private readonly quizQuestionService: QuizQuestionService,
    ) {
        super(quizAttemptRepository);
    }

    async startQuizAttempt(studyProfileId: string, quizId: string): Promise<QuizAttempt> {
        // Tạo mới quiz attempt cho học sinh
        const newAttempt = this.quizAttemptRepository.create({
            studyProfile: { id: studyProfileId },
            quiz: { id: quizId },
            attemptdatetime: new Date(),
            status: QuizAttemptStatus.IN_PROGRESS,
        });

        return await this.quizAttemptRepository.save(newAttempt);
    }

    async saveQuizAttemptProgress(
        quizAttemptId: string,
        questionId: string,
        selectedAnswerId: string,
    ): Promise<void> {
        // Step 1: Fetch the existing QuizAttempt
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
        });

        if (!quizAttempt) {
            throw new NotFoundException(`QuizAttempt with ID ${quizAttemptId} not found`);
        }

        // Step 2: Verify if the selected answer is correct
        const isCorrect = await this.quizQuestionService.verifyAnswer(
            questionId,
            selectedAnswerId,
        );

        // Step 3: Save or update the answer in QuizAttemptAnswer
        const existingAnswer = await this.quizAttemptAnswerService.findAnswer(
            quizAttemptId,
            questionId,
        );

        if (existingAnswer) {
            // Update existing answer
            existingAnswer.studentAnswer = selectedAnswerId;
            existingAnswer.isCorrect = isCorrect;
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(existingAnswer);
        } else {
            // Insert a new answer if not found
            await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
                quizAttemptId,
                questionId,
                selectedAnswerId,
                isCorrect,
            );
        }

        // Step 4: Update progress status in QuizAttempt
        await this.updateProgress(quizAttemptId, {
            status: QuizAttemptStatus.IN_PROGRESS,
        });
    }

    async completeQuizAttempt(
        quizId: string,
        completeQuizAttemptDto: CompleteQuizAttemptDto,
    ): Promise<CompleteQuizAttemptResponseDto> {
        const { studyProfileId } = completeQuizAttemptDto;

        // Step 1: Retrieve all answers for the current quiz attempt
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: {
                quiz: { id: quizId },
                studyProfile: { id: studyProfileId },
                status: QuizAttemptStatus.IN_PROGRESS,
            },
            relations: ['answers', 'answers.quizQuestion'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Ongoing Quiz Attempt not found for Quiz ID ${quizId}`,
            );
        }

        //Calculate score
        let correctAnswers = 0;
        const totalQuestions = quizAttempt.answers.length;

        for (const answer of quizAttempt.answers) {
            const isCorrect = await this.quizQuestionService.verifyAnswer(
                answer.quizQuestion.id,
                answer.studentAnswer,
            );

            // Update the correctness status of each answer in QuizAttemptAnswer
            answer.isCorrect = isCorrect;
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(answer);

            if (isCorrect) correctAnswers++;
        }

        const score = (correctAnswers / totalQuestions) * 100;

        // Step 2: Save the completed QuizAttempt with the final score
        quizAttempt.score = score;
        quizAttempt.status = QuizAttemptStatus.COMPLETED;
        quizAttempt.attemptdatetime = new Date();
        const savedQuizAttempt = await this.quizAttemptRepository.save(quizAttempt);

        // Step 3: Assess Skills and Track Level Changes
        const skillsResult = await this.assessSkillProgress(savedQuizAttempt.id);

        // Step 4: Recommend Units based on Weak Skills
        const recommendedUnits = await this.findWeakSkillsByQuizAttempt(
            savedQuizAttempt.id,
        );

        // Step 5: Evaluate Progress Compared to Previous Attempts
        const progressEvaluation = await this.evaluateQuizProgress(
            studyProfileId,
            quizId,
            score,
        );

        // Step 6: Calculate Course Mastery
        const courseMastery = await this.calculateCourseMastery(studyProfileId);

        // Step 7: Get Current Unit for Quiz
        const currentUnit = await this.quizService.getCurrentUnitForQuiz(quizId);

        // Step 8: Format and Return Data
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

    // async completeQuizAttempt(quizAttemptId: string): Promise<QuizAttempt> {
    //     const quizAttempt = await this.quizAttemptRepository.findOne({
    //         where: { id: quizAttemptId },
    //         relations: ['answers', 'answers.quizQuestion'],
    //     });

    //     if (!quizAttempt) {
    //         throw new NotFoundException(
    //             `Quiz Attempt with id ${quizAttemptId} not found`,
    //         );
    //     }

    //     // Tính toán điểm
    //     const totalQuestions = quizAttempt.answers.length;
    //     const correctAnswers = quizAttempt.answers.filter(
    //         (a) => a.isCorrect,
    //     ).length;
    //     const score = (correctAnswers / totalQuestions) * 100;

    //     // Cập nhật điểm và trạng thái của quiz attempt
    //     quizAttempt.score = score;
    //     return await this.quizAttemptRepository.save(quizAttempt);
    // }

    async findWeakSkillsByQuizAttempt(quizAttemptId: string): Promise<Skill[]> {
        // Load the quiz attempt with related answers and questions
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['answers', 'answers.quizQuestion', 'answers.quizQuestion.skill'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with id ${quizAttemptId} not found`,
            );
        }

        // Map to accumulate correct/total counts per skill
        const skillAccuracyMap = new Map<
            string,
            { skill: Skill; correct: number; total: number }
        >();

        // Calculate correct and total answer counts per skill
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

        // Determine weak skills (accuracy < 70%)
        const weakSkills: Skill[] = [];
        for (const { skill, correct, total } of skillAccuracyMap.values()) {
            const accuracy = (correct / total) * 100;
            if (accuracy < 70) {
                weakSkills.push(skill);
            }
        }

        return weakSkills;
    }

    async updateProgress(
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

    async assessSkillProgress(
        quizAttemptId: string,
    ): Promise<{ skillsSummary: any; skillDetails: any }> {
        // Get current answers for the quiz attempt
        const answers =
            await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);
        const skillScores = new Map<string, { correct: number; total: number }>();

        for (const answer of answers) {
            const skillId = answer.quizQuestion.skill.id;
            if (!skillScores.has(skillId)) {
                skillScores.set(skillId, { correct: 0, total: 0 });
            }

            const skillScore = skillScores.get(skillId);
            skillScore.total += 1;
            if (answer.isCorrect) skillScore.correct += 1;
        }

        // Calculate current accuracy
        const currentSkillsSummary = Array.from(skillScores.entries()).map(
            ([skillId, score]) => ({
                skillId,
                currentAccuracy: (score.correct / score.total) * 100,
            }),
        );

        // Fetch the previous attempt for comparison
        const previousAttempt =
            await this.getPreviousAttempt(quizAttemptId);
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

        // Merge current and previous summaries
        const skillsSummary = currentSkillsSummary.map((current) => {
            const previous = previousSkillsSummary.find(
                (p) => p.skillId === current.skillId,
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

    async calculateCourseMastery(studyProfileId: string): Promise<number> {
        // Lấy tất cả QuizAttempt đã hoàn thành của học sinh
        const completedAttempts = await this.quizAttemptRepository.find({
            where: {
                studyProfile: { id: studyProfileId },
                status: QuizAttemptStatus.COMPLETED,
            },
        });

        if (completedAttempts.length === 0) return 0;

        // Tính điểm trung bình của các lần attempt
        const totalScore = completedAttempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0,
        );
        return totalScore / completedAttempts.length;
    }

    async evaluateQuizProgress(
        studyProfileId: string,
        quizId: string,
        currentScore: number,
    ): Promise<{
        progress: 'improved' | 'declined' | 'same';
        previousScore: number | null;
    }> {
        // Step 1: Get the latest completed quiz attempt for comparison
        const previousAttempt = await this.quizAttemptRepository.findOne({
            where: {
                studyProfile: { id: studyProfileId },
                quiz: { id: quizId },
                status: QuizAttemptStatus.COMPLETED, // Assuming we have a status field
            },
            order: { attemptdatetime: 'DESC' },
        });

        if (!previousAttempt) {
            // Nếu không có lần trước đó để so sánh, đây là lần đầu tiên học sinh làm quiz
            return { progress: 'same', previousScore: null };
        }

        const previousScore = previousAttempt.score;

        // Step 2: Compare current score with previous score
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
        studyProfileId: string,
        unitId: string,
    ): Promise<QuizAttempt | null> {
        // Find the latest quiz attempt for the specified study profile and unit that is still in progress
        const ongoingQuizAttempt = await this.quizAttemptRepository.findOne({
            where: {
                studyProfile: { id: studyProfileId },
                quiz: { unit: { id: unitId } },
                status: QuizAttemptStatus.IN_PROGRESS,
            },
            relations: [
                'quiz',
                'quiz.quizQuestions',
                'quiz.quizQuestions.quizquestion',
                'quiz.unit',
            ], // Fetch related data for unit and quiz questions
            order: {
                attemptdatetime: 'DESC', // Get the most recent in-progress attempt if multiple exist
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
            relations: ['quiz', 'studyProfile'],
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
        // Step 1: Retrieve the Quiz Attempt
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: ['quiz', 'quiz.quizQuestions'],
        });

        if (!quizAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with ID ${quizAttemptId} not found`,
            );
        }

        // Step 2: Get all answered questions
        const answeredQuestions =
            await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);

        // Step 3: Determine progress
        const totalQuestions = quizAttempt.quiz.quizQuestions.length;
        const answeredCount = answeredQuestions.length;
        const progressPercentage = (answeredCount / totalQuestions) * 100;
        const status = quizAttempt.status;

        // Step 4: Structure the response
        return {
            quizAttemptId: quizAttempt.id,
            status,
            progress: {
                totalQuestions,
                answeredQuestions: answeredCount,
                progressPercentage,
                questionsAnswered: answeredQuestions.map((a) => ({
                    questionId: a.quizQuestion.id,
                    selectedAnswerId: a.studentAnswer,
                    isCorrect: a.isCorrect,
                })),
            },
        };
    }

    // In QuizAttemptService

    async getPreviousAttempt(currentQuizAttemptId: string): Promise<QuizAttempt | null> {
        // Find the current quiz attempt to get quiz and studyProfile information
        const currentAttempt = await this.quizAttemptRepository.findOne({
            where: { id: currentQuizAttemptId },
            relations: ['quiz', 'studyProfile'],
        });

        if (!currentAttempt) {
            throw new NotFoundException(
                `Quiz Attempt with ID ${currentQuizAttemptId} not found`,
            );
        }

        // Find the latest previous attempt for the same quiz and study profile
        const previousAttempt = await this.quizAttemptRepository.findOne({
            where: {
                quiz: { id: currentAttempt.quiz.id },
                studyProfile: { id: currentAttempt.studyProfile.id },
                status: QuizAttemptStatus.COMPLETED,
            },
            order: { attemptdatetime: 'DESC' },
        });

        return previousAttempt || null;
    }
}
