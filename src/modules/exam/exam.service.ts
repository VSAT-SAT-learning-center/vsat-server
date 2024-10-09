import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from 'src/database/entities/exam.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';

@Injectable()
export class ExamService {
    constructor(
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        @InjectRepository(ExamType)
        private readonly examTypeRepository: Repository<ExamType>,
    ) {}

    async createExam(createExamDto: CreateExamDto): Promise<Exam> {
        const examStructure = await this.examStructureRepository.findOne({
            where: { id: createExamDto.examStructureId },
        });

        if (!examStructure) {
            throw new HttpException(
                `ExamStructure with ID ${createExamDto.examStructureId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        const examType = await this.examTypeRepository.findOne({
            where: { id: createExamDto.examTypeId },
        });

        if (!examType) {
            throw new HttpException(
                `ExamType with ID ${createExamDto.examTypeId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        const newExam = this.examRepository.create({
            title: createExamDto.title,
            description: createExamDto.description,
            status: createExamDto.status,
            examStructure,
            examType,
        });

        const savedExam = await this.examRepository.save(newExam);

        return savedExam;
    }
}
