import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly unitService: UnitService,
    paginationService: PaginationService,
  ) {
    super(feedbackRepository, paginationService);
  }

  // async createFeedbackForUnit(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
  //   const { unitId, accountId, content } = createFeedbackDto;

  //   const unit = await this.unitService.findOne(unitId);
  //   if (!unit) {
  //     throw new NotFoundException('Unit not found');
  //   }

  //   const feedback = this.feedbackRepository.save({
  //     unit: unit,
  //     accountId,
  //     content,
  //   });

  //   return this.feedbackRepository.save(feedback);
  // }
}