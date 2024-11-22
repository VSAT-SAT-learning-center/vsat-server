import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamQuestion } from 'src/database/entities/examquestion.entity';
import { ExamQuestionService } from './examquestion.service';
import { ExamQuestionController } from './examquestion.controller';
import { Question } from 'src/database/entities/question.entity';
import { Answer } from 'src/database/entities/anwser.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { ExamModule } from '../exam/exam.module'; // Sử dụng forwardRef
import { ModuleTypeModule } from '../module-type/module-type.module';
import { Domain } from 'src/database/entities/domain.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ExamQuestion,
            Question,
            Answer,
            Exam,
            Domain,
            ModuleType
        ]),
        forwardRef(() => ExamModule), // Import với forwardRef
        forwardRef(() => ModuleTypeModule),
    ],
    controllers: [ExamQuestionController],
    providers: [ExamQuestionService],
    exports: [ExamQuestionService],
})
export class ExamQuestionModule {}
