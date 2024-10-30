import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { QuizStatus } from 'src/common/enums/quiz.status.enum';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';

export class CreateQuiz {
    @Expose()
    @ApiProperty({ example: '18610c2e-19f0-429e-8ee3-092e7760dadb' })
    skillId: string;


    quizId: string;

    @Expose()
    @ApiProperty({ example: '9ff028de-d3c4-475e-9f52-1fc596c8e710' })
    levelId: string;

    @Expose()
    @ApiProperty({ example: '19bd7c73-9fe2-4e8b-b13d-bed8694f24dd' })
    sectionId: string;

    answers: QuizAnswer[];

    content: string;

    explain: string;

    status: QuizStatus;
}
