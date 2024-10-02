import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    feedbackRepository: Repository<Feedback>,
    paginationService: PaginationService,
  ) {
    super(feedbackRepository, paginationService);
  }
}