import { Type } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";
import { CreateAnswerDto } from "./create-answer.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateQuestionDto {
  @ApiProperty({ example: '1', description: 'ID of the question' })
  @IsString()
  @IsOptional()
  questionId?: string;

  @ApiProperty({ example: 'What is 2 + 2?', description: 'Prompt of the question' })
  @IsString()
  prompt: string;

  @ApiProperty({ example: '4', description: 'Correct answer for the question' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @ApiProperty({ type: [CreateAnswerDto], description: 'Array of answer objects' })
  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @ApiProperty({ example: 'This is the explanation for the correct answer', description: 'Explanation for the question' })
  @IsString()
  @IsOptional()
  explanation?: string;
}
