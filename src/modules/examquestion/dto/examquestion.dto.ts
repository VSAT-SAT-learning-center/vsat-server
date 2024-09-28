import { Expose } from 'class-transformer';
import { Exam } from 'src/database/entities/exam.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Question } from 'src/database/entities/question.entity';

export class ExamQuestionDTO {
    @Expose()
    id: string;

    @Expose()
    moduleType: ModuleType;

    @Expose()
    exam: Exam;

    @Expose()
    question: Question;

    @Expose()
    status: boolean;
}
