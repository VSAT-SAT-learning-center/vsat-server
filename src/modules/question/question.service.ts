import {
    BadRequestException,
    ConflictException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { In, Repository } from 'typeorm';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { plainToInstance } from 'class-transformer';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { GetQuestionDTO } from './dto/get-question.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { GetQuestionWithAnswerDTO } from './dto/get-with-answer-question.dto';
import { Answerservice } from '../answer/answer.service';
import { Section } from 'src/database/entities/section.entity';
import { CreateQuestionFileDto } from './dto/create-question-file.dto';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,

        private readonly answerService: Answerservice,
    ) {}

    async save(createQuestionDtoArray: CreateQuestionFileDto[]): Promise<{
        savedQuestions: Question[];
        errors: { question: CreateQuestionFileDto; message: string }[];
    }> {
        const savedQuestions: Question[] = [];
        const errors: { question: CreateQuestionFileDto; message: string }[] =
            [];

        for (const createQuestionDto of createQuestionDtoArray) {
            try {
                const { level, skill, section, answers, content } =
                    createQuestionDto;

                const foundLevel = await this.levelRepository.findOne({
                    where: { name: level },
                });
                const foundSkill = await this.skillRepository.findOne({
                    where: { content: skill },
                });
                const foundSection = await this.sectionRepository.findOne({
                    where: { name: section },
                });

                const existingQuestion = await this.questionRepository.findOne({
                    where: { content },
                });

                if (existingQuestion) {
                    throw new HttpException(
                        `Content ${content} is already exsist`,
                        HttpStatus.CONFLICT,
                    );
                }

                if (!foundLevel) {
                    throw new NotFoundException('Level is not found');
                }

                if (!foundSkill) {
                    throw new NotFoundException('Skill is not found');
                }

                if (!foundSection) {
                    throw new NotFoundException('Section is not found');
                }

                if (!createQuestionDto.isSingleChoiceQuestion === null) {
                    throw new HttpException(
                        'IsSingleChoiceQuestion is null',
                        HttpStatus.BAD_REQUEST,
                    );
                }

                const newQuestion = this.questionRepository.create({
                    ...createQuestionDto,
                    level: foundLevel,
                    skill: foundSkill,
                    section: foundSection,
                });

                const savedQuestion =
                    await this.questionRepository.save(newQuestion);

                await this.answerService.createMultipleAnswers(
                    savedQuestion.id,
                    answers,
                );

                savedQuestions.push(savedQuestion);
            } catch (error) {
                errors.push({
                    question: createQuestionDto,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedQuestions,
            errors,
        };
    }

    async saveManual(createQuestionDto: CreateQuestionDTO): Promise<Question> {
        const { levelId, skillId, sectionId, answers, content } =
            createQuestionDto;

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

        const existingQuestion = await this.questionRepository.findOne({
            where: { content },
        });
        if (existingQuestion) {
            throw new ConflictException(`Content '${content}' already exists`);
        }

        if (createQuestionDto.isSingleChoiceQuestion === null) {
            throw new HttpException(
                'isSingleChoiceQuestion cannot be null',
                HttpStatus.BAD_REQUEST,
            );
        }

        const newQuestion = this.questionRepository.create({
            ...createQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: foundSection,
        });

        const savedQuestion = await this.questionRepository.save(newQuestion);

        await this.answerService.createMultipleAnswers(
            savedQuestion.id,
            answers,
        );

        return savedQuestion;
    }

    async getAllWithStatus(
        page: number,
        pageSize: number,
        status: QuestionStatus,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['section', 'level', 'skill'],
            skip: skip,
            take: pageSize,
            where: { status },
            order: {
                createdat: 'DESC',
            },
        });

        const totalPages = Math.ceil(total / pageSize);
        return {
            data: plainToInstance(GetQuestionDTO, questions, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async updateStatus(id: string, status: QuestionStatus): Promise<boolean> {
        if (!Object.values(QuestionStatus).includes(status)) {
            throw new BadRequestException(`Invalid status value: ${status}`);
        }

        const question = await this.questionRepository.findOneBy({ id });
        if (!question) {
            throw new NotFoundException('Question not found');
        }

        question.status = status;

        await this.questionRepository.save(question);
        return true;
    }

    async updateQuestionNotApproved(
        id: string,
        updateQuestionDto: UpdateQuestionDTO,
    ): Promise<UpdateQuestionDTO> {
        const { levelId, skillId, secionId } = updateQuestionDto;

        const foundLevel = await this.levelRepository.findOne({
            where: { id: levelId },
        });
        const foundSkill = await this.skillRepository.findOne({
            where: { id: skillId },
        });
        const foundSeciton = await this.sectionRepository.findOne({
            where: { id: secionId },
        });

        if (!foundLevel || !foundSkill || !foundSeciton) {
            throw new HttpException(
                'Some relations not found',
                HttpStatus.BAD_REQUEST,
            );
        }
        const question = await this.questionRepository.findOneBy({ id });

        if (!question) {
            throw new NotFoundException('Not found question');
        }

        if (question.status === QuestionStatus.APPROVED) {
            throw new HttpException(
                'Cannot update an approved question because approved',
                HttpStatus.BAD_REQUEST,
            );
        }

        Object.assign(question, {
            ...updateQuestionDto,
            level: foundLevel,
            skill: foundSkill,
            section: secionId,
        });

        const updatedQuestion = await this.questionRepository.save(question);

        return plainToInstance(UpdateQuestionDTO, updatedQuestion, {
            excludeExtraneousValues: true,
        });
    }

    async getQuestionWithAnswer(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['answers'],
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuestionWithAnswerDTO, questions, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async publish(questionIds: string[]): Promise<void> {
        const questions = await this.questionRepository.find({
            where: { id: In(questionIds) },
        });

        if (questions.length === 0) {
            throw new NotFoundException('Question is not found');
        }

        for (const question of questions) {
            question.status = QuestionStatus.PENDING;
        }

        await this.questionRepository.save(questions);
    }
}
