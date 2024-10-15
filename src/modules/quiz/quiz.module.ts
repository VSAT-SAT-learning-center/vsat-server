import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from 'src/database/entities/quiz.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Unit])],
  providers: [QuizService],
  controllers: [QuizController],
})
export class QuizModule {}
