import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { BaseService } from '../base/base.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { plainToInstance } from 'class-transformer';
import { GetExamStructureDto } from './dto/get-examstructure.dto';
import { ExamStructureConfigService } from '../exam-structure-config/exam-structure-config.service';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ModuleTypeService } from '../module-type/module-type.service';

@Injectable()
export class ExamStructureService {
    constructor(
        @InjectRepository(ExamStructure)
        private readonly repository: Repository<ExamStructure>,
        @InjectRepository(ExamStructureType)
        private readonly examStructureTypeRepository: Repository<ExamStructureType>,
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,

        private readonly examStructureConfigService: ExamStructureConfigService,
        private readonly moduleTypeService: ModuleTypeService,
    ) {}

    async save(
        createExamStructure: CreateExamStructureDto,
    ): Promise<CreateExamStructureDto> {
        const {
            examScoreId,
            examStructureType,
            structurename,
            description,
            requiredCorrectInModule1RW,
            requiredCorrectInModule1M,
            examStructureConfig,
            moduleType,
        } = createExamStructure;

        const examstructureTypeEntity =
            await this.examStructureTypeRepository.findOne({
                where: { name: examStructureType },
            });

        if (!examstructureTypeEntity) {
            throw new NotFoundException('ExamStructureType is not found');
        }

        const examScore = await this.examScoreRepository.findOne({
            where: { id: examScoreId },
        });

        const newExamStructure = this.repository.create({
            examScore: examScore,
            examStructureType: examstructureTypeEntity,
            structurename,
            description,
            requiredCorrectInModule1RW,
            requiredCorrectInModule1M,
        });

        const savedExamstructure = await this.repository.save(newExamStructure);

        await this.examStructureConfigService.save(
            savedExamstructure.id,
            examStructureConfig,
        );

        await this.moduleTypeService.save(savedExamstructure.id, moduleType)

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
