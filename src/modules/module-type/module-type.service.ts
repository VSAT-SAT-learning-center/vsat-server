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
import { DomainDistributionService } from '../domain-distribution/domain-distribution.service';

@Injectable()
export class ModuleTypeService extends BaseService<ModuleType> {
    constructor(
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        paginationService: PaginationService,
        private readonly domainDistributionService: DomainDistributionService,
    ) {
        super(moduleTypeRepository, paginationService);
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
            });

            const saveModuleType = await this.moduleTypeRepository.save(createdModuleType);

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
}
