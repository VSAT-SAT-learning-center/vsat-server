import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from 'src/database/entities/skill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class SkillService extends BaseService<Skill> {
  constructor(
    @InjectRepository(Skill)
    skillRepository: Repository<Skill>,
    paginationService: PaginationService,
  ) {
    super(skillRepository, paginationService);
  }
}
