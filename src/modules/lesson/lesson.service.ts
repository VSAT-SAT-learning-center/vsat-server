import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const lessons = await this.lessonRepository.find({
      relations: ['unitArea'],
    });

    const sortedLessons = this.paginationService.sort(lessons, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedLessons,
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
    return await this.lessonRepository.findOne({ 
      where: { id },
      relations: ['unitArea'] });
  }

  async create(createLessonDto: CreateLessonDto) {
    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    await this.lessonRepository.update(id, updateLessonDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.lessonRepository.delete(id);
    return { deleted: true };
  }
}
