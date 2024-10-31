import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

import { BaseService } from '../base/base.service';

@Injectable()
export class TargetLearningService extends BaseService<TargetLearning> {
  constructor(
    @InjectRepository(TargetLearning)
    private readonly targetLearningRepository: Repository<TargetLearning>,
  ) {
    super(targetLearningRepository);
  }

  async save(){

  }
}