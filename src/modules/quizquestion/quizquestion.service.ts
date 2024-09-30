import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { Repository } from 'typeorm';
import { QuizQuestionDTO } from './dto/quizquestion.dto';

@Injectable()
export class QuizQuestionService {
    constructor(
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,
    ) {}

    // save
    async save(quizQuestionDto: QuizQuestionDTO): Promise<QuizQuestionDTO> {
        const savedQuizQuestion = await this.quizQuestionRepository.save(quizQuestionDto);

        if (!savedQuizQuestion) {
            throw new HttpException(
                'Fail to save quiz question',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(QuizQuestionDTO, savedQuizQuestion, {
            excludeExtraneousValues: true,
        });
    }

    // update
    async update(id: string, quizQuestionDto: QuizQuestionDTO): Promise<QuizQuestionDTO> {
        const quizQuestion = await this.quizQuestionRepository.findOneBy({ id });

        if (!quizQuestion) {
            throw new HttpException('Quiz Question not found', HttpStatus.NOT_FOUND);
        }

        await this.quizQuestionRepository.update(id, quizQuestionDto);

        const updatedQuizQuestion = await this.quizQuestionRepository.findOneBy({ id });

        return plainToInstance(QuizQuestionDTO, updatedQuizQuestion, {
            excludeExtraneousValues: true,
        });
    }

    // find
    async find(): Promise<QuizQuestionDTO[]> {
        const quizQuestions = await this.quizQuestionRepository.find();
        return plainToInstance(QuizQuestionDTO, quizQuestions, {
            excludeExtraneousValues: true,
        });
    }

    // findById
    async findById(id: string): Promise<QuizQuestionDTO> {
        const quizQuestion = await this.quizQuestionRepository.findOneBy({ id });

        if (!quizQuestion) {
            throw new HttpException('Quiz Question not found', HttpStatus.NOT_FOUND);
        }

        return plainToInstance(QuizQuestionDTO, quizQuestion, {
            excludeExtraneousValues: true,
        });
    }
}
