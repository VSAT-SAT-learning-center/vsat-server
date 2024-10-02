import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessonContent } from 'src/database/entities/lessoncontent.entity';
import { Repository } from 'typeorm';
import { CreateLessonContentDto } from './dto/create-lessoncontent.dto';
import { UpdateLessonContentDto } from './dto/update-lessoncontent.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class LessonContentService extends BaseService<LessonContent> {
  constructor(
    @InjectRepository(LessonContent)
    lessonContentRepository: Repository<LessonContent>,
    paginationService: PaginationService,
  ) {
    super(lessonContentRepository, paginationService);
  }
}