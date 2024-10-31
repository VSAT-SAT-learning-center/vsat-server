import { Injectable } from '@nestjs/common';
import { QuizQuestionItem } from 'src/database/entities/quizquestionitem.entity';
import { BaseService } from '../base/base.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';

@Injectable()
export class QuizQuestionItemService extends BaseService<QuizQuestionItem> {
    constructor(
        @InjectRepository(QuizQuestionItem)
        private readonly quizQuestionItemRepository: Repository<QuizQuestionItem>,
    ) {
        super(quizQuestionItemRepository);
    }

    async insertQuizQuestionItems(
        quizId: string,
        questions: QuizQuestion[],
    ): Promise<void> {
        // Chuẩn bị dữ liệu cho các bản ghi QuizQuestionItem mới
        const quizQuestionItems = questions.map((question) => ({
            quiz: { id: quizId },
            quizquestion: { id: question.id }
        }));
    
        await this.quizQuestionItemRepository.insert(quizQuestionItems);
    }
}
