import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDistributionDto } from './dto/create-domaindistribution.dto';
import { UpdateDomainDistributionDto } from './dto/update-domaindistribution.dto';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { BaseService } from '../base/base.service';

@Injectable()
export class DomainDistributionService extends BaseService<DomainDistribution> {
  constructor(
    @InjectRepository(DomainDistribution)
    domainDistributionRepository: Repository<DomainDistribution>
  ) {
    super(domainDistributionRepository);
  }
}
