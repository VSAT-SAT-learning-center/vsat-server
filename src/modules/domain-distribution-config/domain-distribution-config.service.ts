import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { BaseService } from '../base/base.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateDomainDistributionConfigDto } from './dto/update-domaindistribution-config.dto';
import { max } from 'class-validator';

@Injectable()
export class DomainDistributionConfigService extends BaseService<DomainDistributionConfig> {
    constructor(
        @InjectRepository(DomainDistributionConfig)
        private readonly domainDistributionConfigRepository: Repository<DomainDistributionConfig>,
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
            if (updateDto.percent === undefined) {
                throw new HttpException('Percent is undefined', HttpStatus.BAD_REQUEST);
            } else if (updateDto.minQuestion === undefined) {
                throw new HttpException('Min question is undefined', HttpStatus.BAD_REQUEST);
            } else if (updateDto.maxQuestion === undefined) {
                throw new HttpException('Max question is undefined', HttpStatus.BAD_REQUEST);
            }

            Object.assign(existingDomainDistributionConfig, {
                percent: updateDto.percent,
                minQuestion: updateDto.minQuestion,
                maxQuestion: updateDto.maxQuestion,
            });

            updatedDomainDistributionConfig.push(existingDomainDistributionConfig);
        }
        return this.domainDistributionConfigRepository.save(updatedDomainDistributionConfig);
    }
}
