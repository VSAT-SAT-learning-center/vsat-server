import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class LessonProgressService {
  constructor(
    @InjectRepository(LessonProgress)
    private readonly lessonProgressRepository: Repository<LessonProgress>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const lessonProgresses = await this.lessonProgressRepository.find({
      relations: ['unitAreaProgress', 'lesson'],
    });

    const sortedLessonProgresses = this.paginationService.sort(lessonProgresses, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedLessonProgresses,
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
    return await this.lessonProgressRepository.findOne({ 
      where: { id },
      relations: ['unitAreaProgress', 'lesson'] });
  }

  async create(createLessonProgressDto: CreateLessonProgressDto) {
    const lessonProgress = this.lessonProgressRepository.create(createLessonProgressDto);
    return await this.lessonProgressRepository.save(lessonProgress);
  }

  async update(id: string, updateLessonProgressDto: UpdateLessonProgressDto) {
    await this.lessonProgressRepository.update(id, updateLessonProgressDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.lessonProgressRepository.delete(id);
    return { deleted: true };
  }
}
