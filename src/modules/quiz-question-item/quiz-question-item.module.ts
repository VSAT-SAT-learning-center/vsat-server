import { Module } from '@nestjs/common';
import { QuizQuestionItemService } from './quiz-question-item.service';
import { QuizQuestionItemController } from './quiz-question-item.controller';
import { QuizQuestionItem } from 'src/database/entities/quizquestionitem.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestionItem])],
  providers: [QuizQuestionItemService],
  controllers: [QuizQuestionItemController],
  exports: [QuizQuestionItemService],
})
export class QuizQuestionItemModule {}
