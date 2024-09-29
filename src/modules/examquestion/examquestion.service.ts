import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { Repository } from 'typeorm';
import { ExamQuestionDTO } from './dto/examquestion.dto';

@Injectable()
export class ExamQuestionService {
    constructor(
        @InjectRepository(ExamQuestion)
        private readonly examQuestionRepository: Repository<ExamQuestion>,
    ) {}

    async find(): Promise<ExamQuestionDTO> {
        return plainToInstance(
            ExamQuestionDTO,
            this.examQuestionRepository.find(),
            { excludeExtraneousValues: true },
        );
    }

    async findById(id: string): Promise<ExamQuestionDTO> {
        const examQuestion = await this.examQuestionRepository.findOneBy({
            id,
        });

        if (!examQuestion) {
            throw new HttpException(
                'ExamQuestion not found',
                HttpStatus.NOT_FOUND,
            );
        }

        return plainToInstance(ExamQuestionDTO, examQuestion, {
            excludeExtraneousValues: true,
        });
    }

    async save(examQuestionDto: ExamQuestionDTO): Promise<ExamQuestionDTO> {
        const saveExamQuestion =
            await this.examQuestionRepository.save(examQuestionDto);
        if (!saveExamQuestion) {
            throw new HttpException('Failed to save', HttpStatus.BAD_REQUEST);
        }

        return plainToInstance(ExamQuestionDTO, saveExamQuestion, {
            excludeExtraneousValues: true,
        });
    }

    async update(
        id: string,
        examQuestionDto: ExamQuestionDTO,
    ): Promise<ExamQuestionDTO> {
        const examQuestion = await this.examQuestionRepository.findOneBy({
            id,
        });

        if (!examQuestion) {
            throw new HttpException(
                'ExamQuestion not found',
                HttpStatus.NOT_FOUND,
            );
        }

        await this.examQuestionRepository.update(id, examQuestionDto);

        return plainToInstance(
            ExamQuestionDTO,
            this.examQuestionRepository.findOneBy({ id }),
            { excludeExtraneousValues: true },
        );
    }
}
