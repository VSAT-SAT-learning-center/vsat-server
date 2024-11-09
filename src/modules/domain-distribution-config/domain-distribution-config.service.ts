import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { BaseService } from '../base/base.service';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDomainDistributionConfigDto } from './dto/update-domaindistribution-config.dto';
import { max } from 'class-validator';
import { CreateDomainDistributionConfigDto } from '../exam-semester/dto/create-examsemester.dto';
import { Domain } from 'src/database/entities/domain.entity';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';

@Injectable()
export class DomainDistributionConfigService extends BaseService<DomainDistributionConfig> {
    constructor(
        @InjectRepository(DomainDistributionConfig)
        private readonly domainDistributionConfigRepository: Repository<DomainDistributionConfig>,

        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
    ) {
        super(domainDistributionConfigRepository);
    }

    async updateDomainDistributionConfig(
        updateDomainDistributionConfig: UpdateDomainDistributionConfigDto[],
    ) {
        const updatedDomainDistributionConfig: DomainDistributionConfig[] = [];

        for (const updateDto of updateDomainDistributionConfig) {
            const existingDomainDistributionConfig =
                await this.domainDistributionConfigRepository.findOne({
                    where: { id: updateDto.id },
                });

            if (!existingDomainDistributionConfig) {
                throw new NotFoundException(
                    `DomainDistributionConfig with ID ${updateDto.id} not found`,
                );
            }
            if (updateDto.percentage === undefined) {
                throw new HttpException('Percent is undefined', HttpStatus.BAD_REQUEST);
            } else if (updateDto.minQuestion === undefined) {
                throw new HttpException('Min question is undefined', HttpStatus.BAD_REQUEST);
            } else if (updateDto.maxQuestion === undefined) {
                throw new HttpException('Max question is undefined', HttpStatus.BAD_REQUEST);
            }

            Object.assign(existingDomainDistributionConfig, {
                percent: updateDto.percentage,
                minQuestion: updateDto.minQuestion,
                maxQuestion: updateDto.maxQuestion,
            });

            updatedDomainDistributionConfig.push(existingDomainDistributionConfig);
        }
        return this.domainDistributionConfigRepository.save(updatedDomainDistributionConfig);
    }

    async createMany(
        createDomainDistributionConfigsDto: CreateDomainDistributionConfigDto[],
        examSemesterId: string,
    ): Promise<DomainDistributionConfig[]> {
        const domainContent = createDomainDistributionConfigsDto.map(
            (dto) => dto.domain,
        );
        const domains = await this.domainRepository.find({
            where: { content: In(domainContent) },
        });

        const domainMap = new Map(
            domains.map((domain) => [domain.content, domain]),
        );

        const createdDomainDistributionConfigs = createDomainDistributionConfigsDto.map((dto) => {
            const domain = domainMap.get(dto.domain);

            if (!domain) {
                throw new NotFoundException(`Domain ${dto.domain} not found`);
            }

            return this.domainDistributionConfigRepository.create({
                ...dto,
                domain,
                examSemester: { id: examSemesterId } as ExamSemester,
            });
        });

        return this.domainDistributionConfigRepository.save(createdDomainDistributionConfigs);
    }
}
