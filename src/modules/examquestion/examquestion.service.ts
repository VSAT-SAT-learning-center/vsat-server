import { plainToInstance } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { Repository } from 'typeorm';
import { ExamQuestionDTO } from './dto/examquestion.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class ExamQuestionService extends BaseService<ExamQuestion> {
  constructor(
    @InjectRepository(ExamQuestion)
    examQuestionRepository: Repository<ExamQuestion>,
    paginationService: PaginationService,
  ) {
    super(examQuestionRepository, paginationService);
  }
}
