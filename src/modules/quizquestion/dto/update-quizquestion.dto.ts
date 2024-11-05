import { Quiz } from './../../../database/entities/quiz.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { CreateAnswerDTO } from 'src/modules/answer/dto/create-answer.dto';
import { GetAnswerDTO } from 'src/modules/answer/dto/get-answer.dto';


export class QuizAnswerDto {
    @Expose()
    @ApiProperty({ example: '9ff028de-d3c4-475e-9f52-1fc596c8e710' })
    id: string;
  
    @Expose()
    @ApiProperty({ example: 'A' })
    label: string;
  
    @Expose()
    @ApiProperty({ example: 'Option text' })
    text: string;
  
    @Expose()
    @ApiProperty({ example: true })
    isCorrectAnswer: boolean;
  }


export class UpdateQuizQuestionDTO{
    @Expose()
    @ApiProperty({ example: '9ff028de-d3c4-475e-9f52-1fc596c8e710' })
    levelId: string;

    @Expose()
    @ApiProperty({ example: '18610c2e-19f0-429e-8ee3-092e7760dadb' })
    skillId: string;

    @Expose()
    @ApiProperty({ example: '19bd7c73-9fe2-4e8b-b13d-bed8694f24dd' })
    sectionId: string;  

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

    @ApiProperty({ type: [QuizAnswerDto] })
    @IsArray()
    @Type(() => QuizAnswerDto)
    answers: QuizAnswerDto[];

    @Expose()
    @ApiProperty()
    @IsBoolean()
    isSingleChoiceQuestion: boolean;

    @Expose()
    status: QuestionStatus
}
