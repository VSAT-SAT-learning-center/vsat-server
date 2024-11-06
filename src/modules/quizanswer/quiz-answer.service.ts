import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { Repository } from 'typeorm';
import { CreateQuizAnswerDTO } from './dto/create-quizanswer.dto';
import { plainToInstance } from 'class-transformer';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { CreateAnswerDTO } from '../answer/dto/create-answer.dto';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class QuizAnswerService {
    constructor(
        @InjectRepository(QuizAnswer)
        private readonly quizAnswerRepository: Repository<QuizAnswer>,
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,
    ) {}

    normalizeContent(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }

    async createMultipleQuizAnswers(
        quizQuestionId: string,
        createMultipleAnswersDto: CreateQuizAnswerDTO[],
    ): Promise<CreateQuizAnswerDTO[]> {
        const savedQuizAnswers: CreateQuizAnswerDTO[] = [];

        for (const answerDto of createMultipleAnswersDto) {
            const { label, text, isCorrectAnswer } = answerDto;

            const quizQuestion = await this.quizQuestionRepository.findOne({
                where: { id: quizQuestionId },
            });

            if (!quizQuestion) {
                throw new NotFoundException(
                    `Question with ID ${quizQuestionId} not found`,
                );
            }

            if (!label) {
                throw new HttpException(
                    `Label should not be empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (!text) {
                throw new HttpException(
                    `Answer should not be empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            if (isCorrectAnswer === undefined || isCorrectAnswer === null) {
                throw new HttpException(
                    `isCorrectAnswer should not be empty`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            const normalizedContent = this.normalizeContent(text);

            const answer = this.quizAnswerRepository.create({
                label,
                text,
                quizquestion: quizQuestion,
                isCorrectAnswer,
                plaintext: normalizedContent
            });

            const savedQuizAnswer =
                await this.quizAnswerRepository.save(answer);
            savedQuizAnswers.push(
                plainToInstance(CreateQuizAnswerDTO, savedQuizAnswer, {
                    excludeExtraneousValues: true,
                }),
            );
        }

        return savedQuizAnswers;
    }
}
