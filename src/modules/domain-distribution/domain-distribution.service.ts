import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { BaseService } from '../base/base.service';
import { Domain } from 'src/database/entities/domain.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class DomainDistributionService extends BaseService<DomainDistribution> {
    constructor(
        @InjectRepository(DomainDistribution)
        private readonly domainDistributionRepository: Repository<DomainDistribution>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
    ) {
        super(domainDistributionRepository);
    }

    async save(moduleTypeId: string, createDomainDistributionDtos: CreateDomainDistributionDto[]) {
        const moduleType = await this.moduleTypeRepository.findOne({
            where: { id: moduleTypeId },
        });

        if (!moduleType) {
            throw new NotFoundException('ModuleType is not found');
        }

        const savedDomainDistributions = [];

        for (const createDomainDistributionDto of createDomainDistributionDtos) {
            const domain = await this.domainRepository.findOne({
                where: { content: createDomainDistributionDto.domain },
            });

            if (!domain) {
                throw new NotFoundException(`Domain "${createDomainDistributionDto.domain}" is not found`);
            }

            const createDomainDistribution = this.domainDistributionRepository.create({
                domain: domain,
                moduleType: moduleType,
            });

            const savedDomainDistribution = await this.domainDistributionRepository.save(createDomainDistribution);
            savedDomainDistributions.push(savedDomainDistribution);
        }

        return plainToInstance(CreateDomainDistributionDto, savedDomainDistributions, {
            excludeExtraneousValues: true,
        });
    }
}
