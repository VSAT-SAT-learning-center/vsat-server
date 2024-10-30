import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { Repository } from 'typeorm';
import { UpdateExamScoreDto } from './dto/update-examscore.dto';
import { CreateExamScoreDto } from './dto/create-examscore.dto';
import { BaseService } from '../base/base.service';
@Injectable()
export class ExamScoreService extends BaseService<ExamScore> {
  constructor(
    @InjectRepository(ExamScore) repository: Repository<ExamScore>, // Inject repository for ExamScore
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass to BaseService
  }
}
