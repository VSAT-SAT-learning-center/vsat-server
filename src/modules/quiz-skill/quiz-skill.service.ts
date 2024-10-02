import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizSkillDto } from './dto/create-quizskill.dto';
import { UpdateQuizSkillDto } from './dto/update-quizskill.dto';
import { QuizSkill } from 'src/database/entities/quizskill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class QuizSkillService {
  constructor(
    @InjectRepository(QuizSkill)
    private readonly quizSkillRepository: Repository<QuizSkill>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const quizSkills = await this.quizSkillRepository.find({
      relations: ['quiz', 'skill'],
    });

    const sortedQuizSkills = this.paginationService.sort(quizSkills, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedQuizSkills,
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
    return await this.quizSkillRepository.findOne({ 
      where: { id },
      relations: ['quiz', 'skill'] });
  }

  async create(createQuizSkillDto: CreateQuizSkillDto) {
    const quizSkill = this.quizSkillRepository.create(createQuizSkillDto);
    return await this.quizSkillRepository.save(quizSkill);
  }

  async update(id: string, updateQuizSkillDto: UpdateQuizSkillDto) {
    await this.quizSkillRepository.update(id, updateQuizSkillDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.quizSkillRepository.delete(id);
    return { deleted: true };
  }
}
