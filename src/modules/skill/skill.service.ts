import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Skill } from 'src/database/entities/skill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class SkillService {
  constructor(
    @InjectRepository(Skill)
    private readonly skillRepository: Repository<Skill>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const skills = await this.skillRepository.find({
      relations: ['domain'],
    });

    const sortedSkills = this.paginationService.sort(skills, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedSkills,
      page,
      pageSize,
    );

    return {
      data,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: string) {
    return await this.skillRepository.findOne({ 
      where: { id },
      relations: ['domain'] });
  }

  async create(createSkillDto: CreateSkillDto) {
    const skill = this.skillRepository.create(createSkillDto);
    return await this.skillRepository.save(skill);
  }

  async update(id: string, updateSkillDto: UpdateSkillDto) {
    await this.skillRepository.update(id, updateSkillDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.skillRepository.delete(id);
    return { deleted: true };
  }
}
