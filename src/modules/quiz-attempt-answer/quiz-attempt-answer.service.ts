import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptAnswerDto } from './dto/create-quizattemptanswer.dto';
import { UpdateQuizAttemptAnswerDto } from './dto/update-quizattemptanswer.dto';
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


    async saveQuizAttemptAnswer(
        quizAttemptId: string,
        quizQuestionId: string,
        isCorrect: boolean,
    ): Promise<QuizAttemptAnswer> {
        const attemptAnswer = this.quizAttemptAnswerRepository.create({
            quizAttempt: { id: quizAttemptId },
            quizQuestion: { id: quizQuestionId },
            iscorrect: isCorrect,
        });

        return await this.quizAttemptAnswerRepository.save(attemptAnswer);
    }
}
