import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamTypeDto } from './dto/create-examtype.dto';
import { UpdateExamTypeDto } from './dto/update-examtype.dto';
import { ExamType } from 'src/database/entities/examtype.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class ExamTypeService extends BaseService<ExamType> {
  constructor(
    @InjectRepository(ExamType) repository: Repository<ExamType>, // Inject repository for ExamType
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}
