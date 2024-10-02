import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { BaseService } from '../base/base.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class ExamStructureService extends BaseService<ExamStructure> {
  constructor(
    @InjectRepository(ExamStructure) repository: Repository<ExamStructure>, // Inject repository for ExamStructure
    paginationService: PaginationService,
  ) {
    super(repository, paginationService); // Pass repository and paginationService to BaseService
  }
}
