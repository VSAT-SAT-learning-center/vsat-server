import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class DomainDistributionService extends BaseService<DomainDistribution> {
  constructor(
    @InjectRepository(DomainDistribution)
    domainDistributionRepository: Repository<DomainDistribution>,
    paginationService: PaginationService,
  ) {
    super(domainDistributionRepository, paginationService);
  }
}
