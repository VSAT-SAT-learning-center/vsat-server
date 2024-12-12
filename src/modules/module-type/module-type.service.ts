import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleTypeDto } from './dto/create-moduletype.dto';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { BaseService } from '../base/base.service';
import { Section } from 'src/database/entities/section.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { plainToInstance } from 'class-transformer';
import { ExamAttemptService } from '../exam-attempt/exam-attempt.service';
import { DomainDistributionService } from '../domain-distribution/domain-distribution.service';
import { ModuleConfig } from './dto/create-moduleconfig.dto';

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
        private readonly domainDistributionService: DomainDistributionService,
    ) {
        super(moduleTypeRepository);
    }

    async save(examStructureId: string, createModuleTypeDtos: CreateModuleTypeDto[]) {
        const examStructure = await this.examStructureRepository.findOne({
            where: { id: examStructureId },
        });

        if (!examStructure) {
            throw new NotFoundException('ExamStructure is not found');
        }

        const savedModuleTypes = [];

        for (const createModuleTypeDto of createModuleTypeDtos) {
            const section = await this.sectionRepository.findOne({
                where: { name: createModuleTypeDto.section },
            });

            if (!section) {
                throw new NotFoundException('Section is not found');
            }

            const createdModuleType = this.moduleTypeRepository.create({
                name: createModuleTypeDto.name,
                section: section,
                examStructure: examStructure,
                level: createModuleTypeDto.level,
                numberofquestion: createModuleTypeDto.numberOfQuestion,
                time: createModuleTypeDto.time,
            });

            const saveModuleType =
                await this.moduleTypeRepository.save(createdModuleType);

            await this.domainDistributionService.save(
                saveModuleType.id,
                Array.isArray(createModuleTypeDto.domainDistribution)
                    ? createModuleTypeDto.domainDistribution
                    : [createModuleTypeDto.domainDistribution],
            );

            savedModuleTypes.push(saveModuleType);
        }

        return plainToInstance(CreateModuleTypeDto, savedModuleTypes, {
            excludeExtraneousValues: true,
        });
    }

    async getModuleDifficulty(
        examAttemptId: string,
        sectionName: string,
    ): Promise<string> {
        const examAttempt = await this.examAttemptService.findOneById(examAttemptId);
        const examStructureId = examAttempt?.exam?.examStructure?.id;

        if (!examStructureId) {
            throw new Error('Exam structure not found for the provided attempt');
        }

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

    async saveModuleConfig(moduleConfigs: ModuleConfig[]): Promise<any> {
        const savedModules = [];

        for (const moduleConfig of moduleConfigs) {
            const module = await this.moduleTypeRepository.findOne({
                where: { id: moduleConfig.moduleId },
            });

            if (!module) {
                throw new NotFoundException(`Module is not found`);
            }

            module.time = moduleConfig.time;

            const savedModule = await this.moduleTypeRepository.save(module);
            savedModules.push(savedModule);
        }

        return savedModules;
    }

    async updateModuleTypestatus(id: string, status: boolean): Promise<ModuleType> {
        const moduleType = await this.findOneById(id);
        if (!moduleType) {
            throw new NotFoundException('ModuleType not found');
        }

        moduleType.status = status;

        const updatedModuleType = await this.moduleTypeRepository.save(moduleType);

        return updatedModuleType;
    }
}
