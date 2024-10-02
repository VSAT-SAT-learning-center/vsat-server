import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonProgressDto } from './dto/create-lessonprogress.dto';
import { UpdateLessonProgressDto } from './dto/update-lessonprogress.dto';
import { LessonProgress } from 'src/database/entities/lessonprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class LessonProgressService extends BaseService<LessonProgress> {
  constructor(
    @InjectRepository(LessonProgress)
    lessonProgressRepository: Repository<LessonProgress>,
    paginationService: PaginationService,
  ) {
    super(lessonProgressRepository, paginationService);
  }
}
