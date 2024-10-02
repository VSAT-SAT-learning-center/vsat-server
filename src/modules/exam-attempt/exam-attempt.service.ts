import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class ExamAttemptService extends BaseService<ExamAttempt> {
  constructor(
    @InjectRepository(ExamAttempt)
    examAttemptRepository: Repository<ExamAttempt>,
    paginationService: PaginationService,
  ) {
    super(examAttemptRepository, paginationService);
  }
}