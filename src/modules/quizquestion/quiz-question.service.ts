import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { BaseService } from '../base/base.service';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { In, Repository } from 'typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateQuizQuestionDto } from './dto/create-quizquestion.dto';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Section } from 'src/database/entities/section.entity';
import { plainToInstance } from 'class-transformer';
import { CreateQuizAnswerDTO } from '../quizanswer/dto/create-quizanswer.dto';
import { validate } from 'class-validator';
import sanitizeHtml from 'sanitize-html';
import { QuizAnswerService } from '../quizanswer/quiz-answer.service';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { GetQuizQuestionDTO } from './dto/get-quizquestion.dto';

@Injectable()
export class QuizQuestionService {
    constructor(
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        private readonly quizAnswerService: QuizAnswerService,
    ) {}

    normalizeContent(content: string): string {
        const strippedContent = sanitizeHtml(content, {
            allowedTags: [],
            allowedAttributes: {},
        });

        return strippedContent.replace(/\s+/g, ' ').trim();
    }

    async saveQuizQuestion(
        createQuizQuestionDto: CreateQuizQuestionDto,
    ): Promise<QuizQuestion> {
        const { levelId, skillId, sectionId, answers, content, plainContent } =
            createQuizQuestionDto;

        const foundLevel = await this.levelRepository.findOne({
            where: { id: levelId },
        });
        if (!foundLevel) {
            throw new NotFoundException('Level not found');
        }

        const foundSkill = await this.skillRepository.findOne({
            where: { id: skillId },
        });
        if (!foundSkill) {
            throw new NotFoundException('Skill not found');
        }

        const foundSection = await this.sectionRepository.findOne({
            where: { id: sectionId },
        });
        if (!foundSection) {
            throw new NotFoundException('Section not found');
        }

        if (!answers || answers.length === 0) {
            throw new Error('Answers array is empty');
        }

        for (const answer of answers) {
            const answerInstance = plainToInstance(CreateQuizAnswerDTO, answer);

            const validationErrors = await validate(answerInstance);
            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }
        }

        const normalizedContent = this.normalizeContent(content);

        const existingQuestion = await this.quizQuestionRepository.findOne({
            where: { plainContent: normalizedContent },
        });

        if (existingQuestion) {
            throw new HttpException(
                `Question already exists`,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (createQuizQuestionDto.isSingleChoiceQuestion === null) {
            throw new HttpException(
                'isSingleChoiceQuestion cannot be null',
                HttpStatus.BAD_REQUEST,
            );
        }

        const newQuizQuestion = this.quizQuestionRepository.create({
            ...createQuizQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
            plainContent: normalizedContent,
        });

        const savedQuizQuestion =
            await this.quizQuestionRepository.save(newQuizQuestion);

        await this.quizAnswerService.createMultipleQuizAnswers(
            savedQuizQuestion.id,
            answers,
        );

        return savedQuizQuestion;
    }

    async getAllWithStatus(
        page: number,
        pageSize: number,
        status: QuizQuestionStatus,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] =
            await this.quizQuestionRepository.findAndCount({
                relations: [
                    'section',
                    'level',
                    'skill',
                    'skill.domain',
                    'answers',
                ],
                skip: skip,
                take: pageSize,
                where: { status },
                order: {
                    updatedat: 'DESC',
                },
            });

        const totalPages = Math.ceil(total / pageSize);
        return {
            data: plainToInstance(GetQuizQuestionDTO, questions, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async publish(questionIds: string[]): Promise<void> {
        const questions = await this.quizQuestionRepository.find({
            where: { id: In(questionIds) },
        });

        if (questions.length === 0) {
            throw new NotFoundException('Question is not found');
        }

        for (const question of questions) {
            question.status = QuizQuestionStatus.PENDING;
        }

        await this.quizQuestionRepository.save(questions);
    }
}
