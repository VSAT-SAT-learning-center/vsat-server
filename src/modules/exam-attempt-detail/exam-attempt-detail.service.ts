import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamAttemptDetailDto } from './dto/create-examattemptdetail.dto';
import { UpdateExamAttemptDetailDto } from './dto/update-examattemptdetail.dto';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class ExamAttemptDetailService extends BaseService<ExamAttemptDetail> {
  constructor(
    @InjectRepository(ExamAttemptDetail)
    examAttemptDetailRepository: Repository<ExamAttemptDetail>,
    paginationService: PaginationService,
  ) {
    super(examAttemptDetailRepository, paginationService);
  }
}
