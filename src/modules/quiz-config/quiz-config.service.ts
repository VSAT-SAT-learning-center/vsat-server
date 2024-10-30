import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizConfigDto } from './dto/create-quizconfig.dto';
import { UpdateQuizConfigDto } from './dto/update-quizconfig.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { BaseService } from '../base/base.service';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';


@Injectable()
export class QuizConfigService extends BaseService<QuizConfig> {
  constructor(
    @InjectRepository(QuizConfig) repository: Repository<QuizConfig>,
  ) {
    super(repository);
  }
}
