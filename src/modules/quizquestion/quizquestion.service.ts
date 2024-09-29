import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizQuestionService {
    constructor(
        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository : Repository<QuizQuestion>
    ){}

}
