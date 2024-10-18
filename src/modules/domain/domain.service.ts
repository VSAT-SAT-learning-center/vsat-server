import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { Domain } from 'src/database/entities/domain.entity';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
@Injectable()
export class DomainService extends BaseService<Domain> {
  constructor(
    @InjectRepository(Domain)
    domainRepository: Repository<Domain>
  ) {
    super(domainRepository);
  }
}
