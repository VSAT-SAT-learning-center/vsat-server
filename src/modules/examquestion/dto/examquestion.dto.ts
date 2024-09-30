import { Expose } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';
import { Exam } from 'src/database/entities/exam.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Question } from 'src/database/entities/question.entity';

export class ExamQuestionDTO extends BaseDTO{
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
