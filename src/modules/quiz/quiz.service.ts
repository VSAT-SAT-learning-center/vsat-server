import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Repository } from 'typeorm';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Unit } from 'src/database/entities/unit.entity';
import { NotFoundError } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { GetQuizDto } from './dto/get-quiz.dto';

@Injectable()
export class QuizService {
    constructor(
        @InjectRepository(Quiz)
        private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
    ) {}

    async save(createQuizDto: CreateQuizDto): Promise<Quiz> {
        const unitExists = await this.unitRepository.findOne({
            where: { id: createQuizDto.unitId },
        });

        if (!unitExists) {
            throw new NotFoundException(
                `Unit with ID ${createQuizDto.unitId} does not exist`,
            );
        }

        const quiz = this.quizRepository.create({
            ...createQuizDto,
            unit: unitExists,
            status: false,
        });

        const saveQuiz = await this.quizRepository.save(quiz);

        return saveQuiz;
    }

    async update(
        id: string,
        updateQuizDto: UpdateQuizDto,
    ): Promise<UpdateQuizDto> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        if (updateQuizDto.unitId) {
            const unitExists = await this.unitRepository.findOne({
                where: { id: updateQuizDto.unitId },
            });

            if (!unitExists) {
                throw new NotFoundException(
                    `Unit with ID ${updateQuizDto.unitId} does not exist`,
                );
            }

            quiz.unit = unitExists;
        }

        Object.assign(quiz, updateQuizDto);

        return plainToInstance(
            UpdateQuizDto,
            await this.quizRepository.save(quiz),
            { excludeExtraneousValues: true },
        );
    }

    async getAll(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [quizzes, total] = await this.quizRepository.findAndCount({
            relations: ['unit'],
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetQuizDto, quizzes, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async getById(id: string): Promise<GetQuizDto> {
        const quiz = await this.quizRepository.findOne({
            where: { id },
            relations: ['unit'],
        });

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${id} not found`);
        }

        return plainToInstance(GetQuizDto, quiz, {
            excludeExtraneousValues: true,
        });
    }
}
