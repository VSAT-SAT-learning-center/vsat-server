import { Controller, Get, Post, Body, Param, Delete, Query, Put, HttpStatus } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { BaseController } from '../base/base.controller';
import { Feedback } from 'src/database/entities/feedback.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbackController extends BaseController<Feedback> {
  constructor(feedbackService: FeedbackService) {
    super(feedbackService, 'Feedback');
  }
}
