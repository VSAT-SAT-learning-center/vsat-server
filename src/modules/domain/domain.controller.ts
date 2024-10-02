import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { Domain } from 'src/database/entities/domain.entity';

@ApiTags('Domains')
@Controller('domains')
export class DomainController extends BaseController<Domain> {
  constructor(domainService: DomainService) {
    super(domainService, 'Domain');
  }
}
