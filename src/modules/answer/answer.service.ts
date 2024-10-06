import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from 'src/database/entities/anwser.entity';
import { Repository } from 'typeorm';
import { CreateMultipleAnswersDTO } from './dto/create-answer.dto';
import { plainToInstance } from 'class-transformer';
import { Question } from 'src/database/entities/question.entity';
import { CheckAnswerDTO } from './dto/check-answer.dto';

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
                { isCorretAnswer: false },
            );

            answer.isCorretAnswer = true;
            await this.answerRepository.save(answer);
        }

        return true;
    }

    async createMultipleAnswers(
        createMultipleAnswersDto: CreateMultipleAnswersDTO,
    ): Promise<CreateMultipleAnswersDTO[]> {
        const savedAnswers: CreateMultipleAnswersDTO[] = [];

        for (const answerDto of createMultipleAnswersDto.answers) {
            const { questionId, label, text } = answerDto;

            const question = await this.questionRepository.findOne({
                where: { id: questionId },
            });

            if (!question) {
                throw new NotFoundException(
                    `Question with ID ${questionId} not found`,
                );
            }

            const answer = this.answerRepository.create({
                label,
                text,
                question,
            });

            const savedAnswer = await this.answerRepository.save(answer);
            savedAnswers.push(
                plainToInstance(CreateMultipleAnswersDTO, savedAnswer, {
                    excludeExtraneousValues: true,
                }),
            );
        }

        return savedAnswers;
    }

    async checkAnswer(
        answers: CheckAnswerDTO[],
    ): Promise<
        {
            questionId: string;
            isCorrect: boolean;
        }[]
    > {
        const results = [];

        for (const answerDto of answers) {
            const { questionId, answerId } = answerDto;

            const correctAnswers = await this.answerRepository.find({
                where: { question: { id: questionId }, isCorretAnswer: true },
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
