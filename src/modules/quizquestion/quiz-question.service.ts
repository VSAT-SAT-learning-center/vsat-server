import { Injectable } from "@nestjs/common";
import { BaseService } from "../base/base.service";
import { QuizQuestion } from "src/database/entities/quizquestion.entity";
import { Repository } from "typeorm";
import { PaginationService } from "src/common/helpers/pagination.service";
import { InjectRepository } from "@nestjs/typeorm";


@Injectable()
export class QuizQuestionService extends BaseService<QuizQuestion> {
  constructor(
    @InjectRepository(QuizQuestion)
    quizQuestionRepository: Repository<QuizQuestion>,
    paginationService: PaginationService,
  ) {
    super(quizQuestionRepository, paginationService);
  }
}
