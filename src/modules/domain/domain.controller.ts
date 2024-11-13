import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { BaseController } from '../base/base.controller';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Domain } from 'src/database/entities/domain.entity';
import { DomainDto } from './dto/domain.dto';

@ApiTags('Domains')
@Controller('domains')
@ApiBearerAuth('JWT-auth')
export class DomainController extends BaseController<Domain> {
  constructor(private readonly domainService: DomainService) {
    super(domainService, 'Domain');
  }

  @Get('section/:sectionId')
  async getDomainsBySectionId(@Param('sectionId') sectionId: string): Promise<DomainDto[]> {
    return this.domainService.getDomainsBySectionId(sectionId);
  }
}
