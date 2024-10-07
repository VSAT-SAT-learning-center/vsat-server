import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import {
    HttpException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExamType } from 'src/database/entities/examtype.entity';
import { GetExamTypeDTO } from './dto/get-examtype.dto';
import { plainToInstance } from 'class-transformer';
import { CreateExamTypeDto } from './dto/create-examtype.dto';

@Injectable()
export class ExamTypeService {
    constructor(
        @InjectRepository(ExamType)
        private readonly examTypeRepository: Repository<ExamType>,
    ) {}

    async getAll(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [examType, total] = await this.examTypeRepository.findAndCount({
            skip: skip,
            take: pageSize,
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: plainToInstance(GetExamTypeDTO, examType, {
                excludeExtraneousValues: true,
            }),
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async save(
        createExamTypeDto: CreateExamTypeDto,
    ): Promise<CreateExamTypeDto> {
        const saveExamType =
            await this.examTypeRepository.save(createExamTypeDto);

        if (!saveExamType) {
            throw new HttpException(
                'Failed to save exam type',
                HttpStatus.BAD_REQUEST,
            );
        }

        return plainToInstance(CreateExamTypeDto, saveExamType, {
            excludeExtraneousValues: true,
        });
    }

    async update(
        id: string,
        updateExamTypeDto: UpdateExamTypeDto,
    ): Promise<UpdateExamTypeDto> {
        const examType = await this.examTypeRepository.findOneBy({ id });

        if (!examType) {
            throw new NotFoundException('Not found exam type');
        }

        Object.assign(examType, updateExamTypeDto);

        const updateExamType = await this.examTypeRepository.save(examType);

        return plainToInstance(UpdateExamTypeDto, updateExamType, {
            excludeExtraneousValues: true,
        });
    }
}
