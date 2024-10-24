import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsString,
    ValidateNested,
} from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { CreateAnswerDTO } from 'src/modules/answer/dto/create-answer.dto';

export class CreateQuestionDTO extends BaseDTO {
    @Expose()
    @ValidateNested()
    @ApiProperty({ example: '9ff028de-d3c4-475e-9f52-1fc596c8e710' })
    levelId: string;

    @Expose()
    @ValidateNested()
    @ApiProperty({ example: '18610c2e-19f0-429e-8ee3-092e7760dadb' })
    skillId: string;

    @Expose()
    @ValidateNested()
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

    @ApiProperty({ type: [CreateAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDTO)
    answers: CreateAnswerDTO[];

    @Expose()
    @ApiProperty()
    @IsBoolean()
    isSingleChoiceQuestion: boolean;
}
