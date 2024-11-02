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

    async startQuizAttempt(
        studyProfileId: string,
        quizId: string,
    ): Promise<QuizAttempt> {
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
            throw new NotFoundException(
                `QuizAttempt with ID ${quizAttemptId} not found`,
            );
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
            await this.quizAttemptAnswerService.updateQuizAttemptAnswer(
                existingAnswer,
            );
        } else {
            // Insert a new answer if not found
            await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
                quizAttemptId,
                questionId,
                selectedAnswerId,
                isCorrect,
            );
        }

        // Step 4: (Optional) Update progress status in QuizAttempt
        await this.updateProgress(quizAttemptId, {
            status: QuizAttemptStatus.IN_PROGRESS,
        });
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

    async completeQuizAttempt(
        quizId: string,
        completeQuizAttemptDto: CompleteQuizAttemptDto,
    ): Promise<any> {
        const { studyProfileId, answers } = completeQuizAttemptDto;
    
        // Step 1: Calculate Score
        let correctAnswers = 0;
        const totalQuestions = answers.length;
    
        for (const answer of answers) {
            const isCorrect = await this.quizQuestionService.verifyAnswer(
                answer.questionId,
                answer.selectedAnswerId,
            );
    
            // Store or update answer in QuizAttemptAnswer
            const existingAnswer = await this.quizAttemptAnswerService.findAnswer(
                quizId,
                answer.questionId,
            );
    
            if (existingAnswer) {
                existingAnswer.studentAnswer = answer.selectedAnswerId;
                existingAnswer.isCorrect = isCorrect;
                await this.quizAttemptAnswerService.updateQuizAttemptAnswer(existingAnswer);
            } else {
                await this.quizAttemptAnswerService.saveQuizAttemptAnswer(
                    quizId,
                    answer.questionId,
                    answer.selectedAnswerId,
                    isCorrect,
                );
            }
    
            if (isCorrect) correctAnswers++;
        }
    
        const score = (correctAnswers / totalQuestions) * 100;
    
        // Step 2: Save QuizAttempt record with final score
        const quizAttempt = await this.quizAttemptRepository.create({
            quiz: { id: quizId },
            studyProfile: { id: studyProfileId },
            attemptdatetime: new Date(),
            score,
            status: QuizAttemptStatus.COMPLETED,
        });
    
        const savedQuizAttempt = await this.quizAttemptRepository.save(quizAttempt);
    
        // Step 3: Assess Skills and Track Level Changes
        const skillsResult = await this.assessSkillProgress(savedQuizAttempt.id);
    
        // Step 4: Recommend Units based on Weak Skills
        const recommendedUnits = await this.findWeakSkillsByQuizAttempt(savedQuizAttempt.id);
    
        // Step 5: Format and Return Data
        return {
            quizProgress: score,
            courseMastery: this.calculateCourseMastery(studyProfileId),
            currentUnit: this.quizService.getCurrentUnitForQuiz(quizId),
            skillsSummary: skillsResult.skillsSummary,
            skillDetails: skillsResult.skillDetails,
            recommendedLessons: recommendedUnits,
        };
    }
    

    async findWeakSkillsByQuizAttempt(quizAttemptId: string): Promise<Skill[]> {
        // Load the quiz attempt with related answers and questions
        const quizAttempt = await this.quizAttemptRepository.findOne({
            where: { id: quizAttemptId },
            relations: [
                'answers',
                'answers.quizQuestion',
                'answers.quizQuestion.skill',
            ],
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

    async assessSkillProgress(quizAttemptId: string): Promise<{ skillsSummary: any; skillDetails: any }> {
        // Lấy các câu trả lời trong QuizAttempt
        const answers = await this.quizAttemptAnswerService.findAnswersByQuizAttemptId(quizAttemptId);
        const skillScores = new Map<string, { correct: number; total: number }>();
    
        // Xử lý từng câu trả lời
        for (const answer of answers) {
            const skillId = answer.quizQuestion.skill.id;
            const isCorrect = answer.isCorrect;
    
            // Khởi tạo nếu chưa có skillId trong map
            if (!skillScores.has(skillId)) {
                skillScores.set(skillId, { correct: 0, total: 0 });
            }
    
            // Cập nhật điểm kỹ năng
            const skillScore = skillScores.get(skillId);
            if (skillScore) {
                skillScore.total += 1;
                if (isCorrect) skillScore.correct += 1;
            }
        }
    
        // Tạo dữ liệu kết quả
        const skillsSummary = Array.from(skillScores.entries()).map(([skillId, score]) => ({
            skillId,
            accuracy: (score.correct / score.total) * 100,
        }));
        const skillDetails = skillsSummary; // Có thể tùy chỉnh nếu cần chi tiết hơn
    
        return { skillsSummary, skillDetails };
    }

    async calculateCourseMastery(studyProfileId: string): Promise<number> {
        // Lấy tất cả QuizAttempt đã hoàn thành của học sinh
        const completedAttempts = await this.quizAttemptRepository.find({
            where: { studyProfile: { id: studyProfileId }, status: QuizAttemptStatus.COMPLETED },
        });
    
        if (completedAttempts.length === 0) return 0;
    
        // Tính điểm trung bình của các lần attempt
        const totalScore = completedAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
        return totalScore / completedAttempts.length;
    }
    
}
