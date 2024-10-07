import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from 'src/database/entities/lesson.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { BaseService } from '../base/base.service';

@Injectable()
export class LessonService extends BaseService<Lesson> {
  constructor(
    @InjectRepository(Lesson)
    lessonRepository: Repository<Lesson>,
    paginationService: PaginationService,
  ) {
    super(lessonRepository, paginationService);
  }
}
