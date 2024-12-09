import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizAttemptAnswer } from 'src/database/entities/quizattemptanswer.entity';
import { BaseService } from '../base/base.service';

@Injectable()
export class QuizAttemptAnswerService extends BaseService<QuizAttemptAnswer> {
    constructor(
        @InjectRepository(QuizAttemptAnswer)
        private readonly quizAttemptAnswerRepository: Repository<QuizAttemptAnswer>,
    ) {
        super(quizAttemptAnswerRepository);
    }

    async findAnswer(
        quizAttemptId: string,
        questionId: string,
    ): Promise<QuizAttemptAnswer | undefined> {
        return this.quizAttemptAnswerRepository.findOne({
            where: {
                quizAttempt: { id: quizAttemptId },
                quizQuestion: { id: questionId },
            },
        });
    }

    async saveQuizAttemptAnswer(
        quizAttemptId: string,
        questionId: string,
        studentAnswerId: string,
        studentAnswerText: string,
        isCorrect: boolean,
    ): Promise<QuizAttemptAnswer> {
        const newAnswer = this.quizAttemptAnswerRepository.create({
            quizAttempt: { id: quizAttemptId },
            quizQuestion: { id: questionId },
            studentAnswerId: studentAnswerId,
            studentAnswerText: studentAnswerText,
            isCorrect: isCorrect,
        });
        return this.quizAttemptAnswerRepository.save(newAnswer);
    }

    async updateQuizAttemptAnswer(
        quizAttemptAnswer: QuizAttemptAnswer,
    ): Promise<QuizAttemptAnswer> {
        return this.quizAttemptAnswerRepository.save(quizAttemptAnswer);
    }

    async findAnswersByQuizAttemptId(
        quizAttemptId: string,
    ): Promise<QuizAttemptAnswer[]> {
        return this.quizAttemptAnswerRepository.find({
            where: { quizAttempt: { id: quizAttemptId } },
            relations: ['quizQuestion', 'quizQuestion.skill'], // Bao gồm thông tin skill cho mỗi câu hỏi
        });
    }
}
