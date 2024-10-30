import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { BaseService } from '../base/base.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { plainToInstance } from 'class-transformer';
import { GetExamStructureDto } from './dto/get-examstructure.dto';

@Injectable()
export class ExamStructureService {
    constructor(
        @InjectRepository(ExamStructure)
        private readonly repository: Repository<ExamStructure>,
    ) {}

    async save(
        createExamStructure: CreateExamStructureDto,
    ): Promise<CreateExamStructureDto> {
        const savedExamstructure = this.repository.save(createExamStructure);
        return plainToInstance(CreateExamStructureDto, savedExamstructure, {
            excludeExtraneousValues: true,
        });
    }

    async get(page: number, pageSize: number): Promise<any> {
        const [result, total] = await this.repository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
            order: { createdat: 'DESC' },
        });

        const data = plainToInstance(GetExamStructureDto, result, {
            excludeExtraneousValues: true,
        });

        return {
            data,
            total,
        };
    }
}
