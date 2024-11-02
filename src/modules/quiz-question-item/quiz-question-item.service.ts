import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizQuestionItem } from 'src/database/entities/quizquestionitem.entity';
import { BaseService } from '../base/base.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from 'src/database/entities/quiz.entity';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizService } from '../quiz/quiz.service';

@Injectable()
export class QuizQuestionItemService extends BaseService<QuizQuestionItem> {
    constructor(
        @InjectRepository(QuizQuestionItem)
        private readonly quizQuestionItemRepository: Repository<QuizQuestionItem>,

        @InjectRepository(QuizQuestion)
        private readonly quizQuestionRepository: Repository<QuizQuestion>,

        private readonly quizService: QuizService,
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

    async getQuizQuestionsWithAnswers(quizId: string): Promise<any> {
        // Verify if the quiz exists
        const quiz = await this.quizService.findOneById(quizId);

        if (!quiz) {
            throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
        }

        // Retrieve quiz question items along with their questions and answers
        const quizQuestionItems = await this.quizQuestionItemRepository.find({
            where: { quiz: { id: quizId } },
            relations: ['quizquestion', 'quizquestion.answers'],
        });

        // Format the response to include questions and their answers
        return quizQuestionItems.map((item) => ({
            questionId: item.quizquestion.id,
            content: item.quizquestion.content,
            plainContent: item.quizquestion.plainContent,
            explain: item.quizquestion.explain,
            isSingleChoice: item.quizquestion.isSingleChoiceQuestion,
            status: item.quizquestion.status,
            answers: item.quizquestion.answers.map((answer) => ({
                answerId: answer.id,
                label: answer.label,
                text: answer.text,
                isCorrect: answer.isCorrectAnswer,
            })),
        }));
    }
}
