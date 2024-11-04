import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { UpdateModuleTypeDto } from './dto/update-moduletype.dto';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { Section } from 'src/database/entities/section.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { plainToInstance } from 'class-transformer';
import { ExamAttemptService } from '../exam-attempt/exam-attempt.service';

@Injectable()
export class ModuleTypeService extends BaseService<ModuleType> {
    constructor(
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,

        private readonly examAttemptService: ExamAttemptService,
    ) {
        super(moduleTypeRepository);
    }

    async save(
        examStructureId: string,
        createModuleTypeDto: CreateModuleTypeDto,
    ) {
        const section = await this.sectionRepository.findOne({
            where: { id: createModuleTypeDto.sectionId },
        });

        const examStructure = await this.examStructureRepository.findOne({
            where: { id: examStructureId },
        });

        if (!section) {
            throw new NotFoundException('Section is not found');
        }

        if (!examStructure) {
            throw new NotFoundException('ExamStructure is not found');
        }

        const createdModuleType = await this.moduleTypeRepository.create({
            ...createModuleTypeDto,
            section: section,
            examStructure: examStructure,
        });

        const save = await this.moduleTypeRepository.save(createdModuleType);

        return plainToInstance(CreateModuleTypeDto, save, {
            excludeExtraneousValues: true,
        });
    }

    async getModuleDifficulty(
        examAttemptId: string,
        sectionName: string,
    ): Promise<string> {
        // Bước 1: Lấy `examStructureId` từ `ExamAttempt`
        const examAttempt =
            await this.examAttemptService.findOneById(examAttemptId);
        const examStructureId = examAttempt?.exam?.examStructure?.id;

        if (!examStructureId) {
            throw new Error(
                'Exam structure not found for the provided attempt',
            );
        }

        // Bước 2: Lấy `ModuleType` với `examStructureId`, `sectionId`, và tên là "Module 2"
        const moduleType = await this.moduleTypeRepository.findOne({
            where: {
                examStructure: { id: examStructureId },
                section: { name: sectionName },
                name: 'Module 2',
            },
            select: ['level'],
        });

        return moduleType?.level || 'Easy';
    }
}
