import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { Skill } from 'src/database/entities/skill.entity';
import { BaseController } from '../base/base.controller';
import { ApiTags } from '@nestjs/swagger';
import { SkillDto } from './dto/skill.dto';

@ApiTags('Skills')
@Controller('skills')
export class SkillController extends BaseController<Skill> {
  constructor(private readonly skillService: SkillService) {
    super(skillService, 'Skill');
  }

  @Get('domain/:domainId')
  async getSkillsByDomainId(@Param('domainId') domainId: string): Promise<SkillDto[]> {
    return this.skillService.getSkillsByDomainId(domainId);
  }
}
