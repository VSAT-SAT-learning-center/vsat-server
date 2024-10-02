import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from 'src/database/entities/exam.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class ExamService extends BaseService<Exam> {
  constructor(
    @InjectRepository(Exam)
    examRepository: Repository<Exam>,
    paginationService: PaginationService,
  ) {
    super(examRepository, paginationService);
  }
}
