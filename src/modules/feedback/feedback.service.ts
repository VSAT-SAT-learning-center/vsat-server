import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly paginationService: PaginationService,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    const feedbacks = await this.feedbackRepository.find({
      relations: ['unit', 'exam', 'question', 'account'],
    });

    const sortedFeedbacks = this.paginationService.sort(feedbacks, sortBy, sortOrder);
    const { data, totalItems, totalPages } = this.paginationService.paginate(
      sortedFeedbacks,
      page,
      pageSize,
    );

    return {
      data,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: string) {
    return await this.feedbackRepository.findOne({
      where: { id },
      relations: ['unit', 'exam', 'question', 'account'],
    });
  }

  async create(createFeedbackDto: CreateFeedbackDto) {
    const feedback = this.feedbackRepository.create(createFeedbackDto);
    return await this.feedbackRepository.save(feedback);
  }

  async update(id: string, updateFeedbackDto: UpdateFeedbackDto) {
    await this.feedbackRepository.update(id, updateFeedbackDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.feedbackRepository.delete(id);
    return { deleted: true };
  }
}
