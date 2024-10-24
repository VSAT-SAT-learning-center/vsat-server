import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from 'src/database/entities/skill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { SkillDto } from './dto/skill.dto';

@Injectable()
export class SkillService extends BaseService<Skill> {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    //paginationService: PaginationService,
  ) {
    super(skillRepository);
  }

  async getSkillsByDomainId(domainId: string): Promise<SkillDto[]> {
    const skills = await this.skillRepository.find({ where: { domain: { id: domainId } } });

    if (!skills || skills.length === 0) {
      throw new NotFoundException(`No skills found for domain ID ${domainId}`);
    }
    
    return skills.map(skill => ({
      id: skill.id,
      content: skill.content,  // Assuming 'name' is the content field
    }));
  }
}
