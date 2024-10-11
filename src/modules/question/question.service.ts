import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/database/entities/question.entity';
import { Repository } from 'typeorm';
import { CreateQuestionDTO } from './dto/create-question.dto';
import { plainToInstance } from 'class-transformer';
import { Unit } from 'src/database/entities/unit.entity';
import { Level } from 'src/database/entities/level.entity';
import { Skill } from 'src/database/entities/skill.entity';
import { Lesson } from 'src/database/entities/lesson.entity';
import { GetQuestionDTO } from './dto/get-question.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { UpdateQuestionDTO } from './dto/update-question.dto';
import { GetQuestionWithAnswerDTO } from './dto/get-with-answer-question.dto';
import { Answerservice } from '../answer/answer.service';

@Injectable()
export class QuestionService {
    constructor(
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Skill)
        private readonly skillRepository: Repository<Skill>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        private readonly answerService: Answerservice,
    ) {}

    async save(
        createQuestionDtoArray: CreateQuestionDTO[],
    ): Promise<Question[]> {
        const savedQuestions: Question[] = [];

        for (const createQuestionDto of createQuestionDtoArray) {
            const { level, unit, skill, lesson, answers } = createQuestionDto;

            const foundUnit = await this.unitRepository.findOne({
                where: { id: unit.id },
            });
            const foundLevel = await this.levelRepository.findOne({
                where: { id: level.id },
            });
            const foundSkill = await this.skillRepository.findOne({
                where: { id: skill.id },
            });
            const foundLesson = await this.lessonRepository.findOne({
                where: { id: lesson.id },
            });

            if (!foundUnit || !foundLevel || !foundSkill || !foundLesson) {
                throw new HttpException(
                    'Some relations not found',
                    HttpStatus.BAD_REQUEST,
                );
            }

            const newQuestion = this.questionRepository.create({
                ...createQuestionDto,
                unit: foundUnit,
                level: foundLevel,
                skill: foundSkill,
                lesson: foundLesson,
            });

            const savedQuestion =
                await this.questionRepository.save(newQuestion);

            await this.answerService.createMultipleAnswers(
                savedQuestion.id,
                answers,
            );

            savedQuestions.push(savedQuestion);
        }

        return savedQuestions;
    }

    async getAll(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [questions, total] = await this.questionRepository.findAndCount({
            relations: ['unit', 'level', 'skill', 'lesson'],
            skip: skip,
            take: pageSize,
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
        const { level, unit, skill, lesson } = updateQuestionDto;

        const foundUnit = await this.unitRepository.findOne({
            where: { id: unit.id },
        });
        const foundLevel = await this.levelRepository.findOne({
            where: { id: level.id },
        });
        const foundSkill = await this.skillRepository.findOne({
            where: { id: skill.id },
        });
        const foundLesson = await this.lessonRepository.findOne({
            where: { id: lesson.id },
        });

        if (!foundUnit || !foundLevel || !foundSkill || !foundLesson) {
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
            unit: foundUnit,
            level: foundLevel,
            skill: foundSkill,
            lesson: foundLesson,
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
}
