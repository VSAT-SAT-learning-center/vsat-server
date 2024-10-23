import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/database/entities/anwser.entity';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Question } from 'src/database/entities/question.entity';
import { CheckAnswerDTO } from './dto/check-answer.dto';
import { CreateAnswerDTO } from '../answer/dto/create-answer.dto';

@Injectable()
export class Answerservice {
    constructor(
        @InjectRepository(Answer)
        private readonly answerRepository: Repository<Answer>,

        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) {}

    async updateAnswer(ids: string[]): Promise<boolean> {
        for (const id of ids) {
            const answer = await this.answerRepository.findOne({
                where: { id },
                relations: ['question'],
            });

            if (!answer) {
                throw new NotFoundException(`Answer with ID ${id} not found`);
            }

            const questionId = answer.question.id;

            await this.answerRepository.update(
                { question: { id: questionId } },
                { isCorrectAnswer: false },
            );

            answer.isCorrectAnswer = true;
            await this.answerRepository.save(answer);
        }

        return true;
    }

    async createMultipleAnswers(
        questionId: string,
        createMultipleAnswersDto: CreateAnswerDTO[],
    ): Promise<CreateAnswerDTO[]> {
        const savedAnswers: CreateAnswerDTO[] = [];

        for (const answerDto of createMultipleAnswersDto) {
            const { label, text, isCorrectAnswer } = answerDto;

            const question = await this.questionRepository.findOne({
                where: { id: questionId },
            });

            if (!question) {
                throw new NotFoundException(
                    `Question with ID ${questionId} not found`,
                );
            }

            if (!label) {
                throw new HttpException(
                    `Lable should not empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (!text) {
                throw new HttpException(
                    `Text should not empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (isCorrectAnswer === undefined || isCorrectAnswer === null) {
                throw new HttpException(
                    `isCorrectAnswer should not empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            const answer = this.answerRepository.create({
                label,
                text,
                question,
                isCorrectAnswer,
            });

            const savedAnswer = await this.answerRepository.save(answer);
            savedAnswers.push(
                plainToInstance(CreateAnswerDTO, savedAnswer, {
                    excludeExtraneousValues: true,
                }),
            );
        }

        return savedAnswers;
    }

    async checkAnswer(answers: CheckAnswerDTO[]): Promise<
        {
            questionId: string;
            isCorrect: boolean;
        }[]
    > {
        const results = [];

        for (const answerDto of answers) {
            const { questionId, answerId } = answerDto;

            const correctAnswers = await this.answerRepository.find({
                where: { question: { id: questionId }, isCorrectAnswer: true },
            });

            if (!correctAnswers.length) {
                throw new NotFoundException(
                    `No correct answers found for question ${questionId}`,
                );
            }

            const correctAnswerIds = correctAnswers.map((answer) => answer.id);

            const isCorrect = correctAnswerIds.includes(answerId);

            results.push({
                questionId: questionId,
                isCorrect: isCorrect,
            });
        }

        return results;
    }
}
