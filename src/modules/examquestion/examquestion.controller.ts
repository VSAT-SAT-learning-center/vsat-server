import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { ExamQuestionService } from './examquestion.service';
import { ExamQuestionDTO } from './dto/examquestion.dto';
import { ResponseHelper } from 'src/common/helpers/response.helper';
import { SuccessMessages } from 'src/common/constants/success-messages';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../base/base.controller';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';

@ApiTags('ExamQuestions')
@Controller('exam-questions')
export class ExamQuestionController extends BaseController<ExamQuestion> {
  constructor(examQuestionService: ExamQuestionService) {
    super(examQuestionService, 'ExamQuestion');
  }
}
