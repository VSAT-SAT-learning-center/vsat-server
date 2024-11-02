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

    async save(createDomainDistributionDto: CreateDomainDistributionDto) {
        const domain = await this.domainDistributionRepository.findOne({
            where: { id: createDomainDistributionDto.domainId },
        });

        const moduleType = await this.moduleTypeRepository.findOne({
            where: { id: createDomainDistributionDto.moduleTypeId },
        });

        if (!domain) {
            throw new NotFoundException('Domain is not found');
        }

        if (!moduleType) {
            throw new NotFoundException('ModuleType is not found');
        }

        const createDomainDistribution =
            await this.domainDistributionRepository.create({
                ...createDomainDistributionDto,
                domain: domain,
                moduleType: moduleType,
            });

        const save = await this.domainDistributionRepository.save(
            createDomainDistribution,
        );

        return plainToInstance(CreateDomainDistributionDto, save, {
            excludeExtraneousValues: true,
        });
    }

    
}
