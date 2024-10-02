import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizAttemptSkillDto } from './dto/create-quizattemptskill.dto';
import { UpdateQuizAttemptSkillDto } from './dto/update-quizattemptskill.dto';
import { QuizAttemptSkill } from 'src/database/entities/quizattemptskill.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class QuizAttemptSkillService {
  constructor(
    @InjectRepository(QuizAttemptSkill)
    private readonly quizAttemptSkillRepository: Repository<QuizAttemptSkill>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const quizAttemptSkills = await this.quizAttemptSkillRepository.find({
      relations: ['quizAttempt', 'skill'],
    });

    const sortedQuizAttemptSkills = this.paginationService.sort(quizAttemptSkills, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedQuizAttemptSkills,
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
    return await this.quizAttemptSkillRepository.findOne({ 
      where: { id },
      relations: ['quizAttempt', 'skill'] });
  }

  async create(createQuizAttemptSkillDto: CreateQuizAttemptSkillDto) {
    const quizAttemptSkill = this.quizAttemptSkillRepository.create(createQuizAttemptSkillDto);
    return await this.quizAttemptSkillRepository.save(quizAttemptSkill);
  }

  async update(id: string, updateQuizAttemptSkillDto: UpdateQuizAttemptSkillDto) {
    await this.quizAttemptSkillRepository.update(id, updateQuizAttemptSkillDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.quizAttemptSkillRepository.delete(id);
    return { deleted: true };
  }
}
