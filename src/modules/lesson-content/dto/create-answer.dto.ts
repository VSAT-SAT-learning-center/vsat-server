import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, isString, IsString, IsUUID } from "class-validator";

export class CreateAnswerDto {
  @ApiProperty({ example: '1', description: 'ID of the answer' })
  @IsString()
  @IsOptional()
  answerId: string;

  @ApiProperty({ example: '4', description: 'Text of the answer' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'A', description: 'Label of the answer (e.g., A, B, C, D)' })
  @IsString()
  @IsNotEmpty()
  label: string;
}
