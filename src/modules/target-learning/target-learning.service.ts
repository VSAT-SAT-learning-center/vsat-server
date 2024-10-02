import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class TargetLearningService extends BaseService<TargetLearning> {
  constructor(
    @InjectRepository(TargetLearning)
    targetLearningRepository: Repository<TargetLearning>,
    paginationService: PaginationService,
  ) {
    super(targetLearningRepository, paginationService);
  }
}