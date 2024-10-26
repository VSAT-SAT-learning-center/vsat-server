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

export class CreateQuestionFileDto {
    @Expose()
    @ValidateNested()
    @ApiProperty({ example: 'Foundation' })
    level: string;

    @Expose()
    @ValidateNested()
    @ApiProperty({ example: 'Area and volume' })
    skill: string;

    @Expose()
    @ValidateNested()
    @ApiProperty({ example: 'Math' })
    section: string;

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