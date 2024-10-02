import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamScoreDetailDto } from './dto/create-examscoredetail.dto';
import { UpdateExamScoreDetailDto } from './dto/update-examscoredetail.dto';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class ExamScoreDetailService extends BaseService<ExamScoreDetail> {
  constructor(
    @InjectRepository(ExamScoreDetail) repository: Repository<ExamScoreDetail>, // Inject repository for ExamScoreDetail
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}