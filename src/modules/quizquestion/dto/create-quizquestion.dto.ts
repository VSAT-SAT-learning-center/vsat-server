import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { QuizAnswer } from 'src/database/entities/quizanswer.entity';
import { CreateQuizAnswerDTO } from 'src/modules/quizanswer/dto/create-quizanswer.dto';

export class CreateQuizQuestionDto {
    @Expose()
    @ApiProperty({ example: '18610c2e-19f0-429e-8ee3-092e7760dadb' })
    skillId: string;

    @Expose()
    @ApiProperty({ example: '9ff028de-d3c4-475e-9f52-1fc596c8e710' })
    levelId: string;

    @Expose()
    @ApiProperty({ example: '19bd7c73-9fe2-4e8b-b13d-bed8694f24dd' })
    sectionId: string;

    @ApiProperty({ type: [CreateQuizAnswerDTO] })
    @IsArray()
    @Type(() => CreateQuizAnswerDTO)
    answers: CreateQuizAnswerDTO[];

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    content: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    explain: string;

    plainContent: string;

    @Expose()
    @ApiProperty()
    @IsBoolean()
    isSingleChoiceQuestion: boolean;

    status: QuizQuestionStatus;
}