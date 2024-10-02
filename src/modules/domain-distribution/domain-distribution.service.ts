import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class DomainDistributionService {
  constructor(
    @InjectRepository(DomainDistribution)
    private readonly domainDistributionRepository: Repository<DomainDistribution>,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.domainDistributionRepository.createQueryBuilder('domaindistribution')
      .leftJoinAndSelect('domaindistribution.domain', 'domain')
      .leftJoinAndSelect('domaindistribution.moduleType', 'moduletype')
      .orderBy(`domaindistribution.${sortBy}`, sortOrder)
      .skip(skip)
      .take(pageSize);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async findOne(id: string) {
    return await this.domainDistributionRepository.findOne({ 
      where: { id },
      relations: ['domain', 'moduleType'] });
  }

  async create(createDomainDistributionDto: CreateDomainDistributionDto) {
    const domainDistribution = this.domainDistributionRepository.create(createDomainDistributionDto);
    return await this.domainDistributionRepository.save(domainDistribution);
  }

  async update(id: string, updateDomainDistributionDto: UpdateDomainDistributionDto) {
    await this.domainDistributionRepository.update(id, updateDomainDistributionDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.domainDistributionRepository.delete(id);
    return { deleted: true };
  }
}
