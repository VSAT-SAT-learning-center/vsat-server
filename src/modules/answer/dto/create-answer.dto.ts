import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAnswerDTO {
    @ApiProperty({
        example: 'A',
    })
    @IsNotEmpty({ message: 'Label should not be empty' })
    label: string;

    @ApiProperty({
        example: '2',
    })
    @IsNotEmpty({ message: 'Answer should not be empty' })
    text: string;

    @ApiProperty({
        example: true,
    })
    @IsNotEmpty({ message: 'Correct answer should not be empty' })
    @IsBoolean()
    isCorrectAnswer: boolean;
}

class CreateMultipleAnswersDTO {
    @ApiProperty({ type: [CreateAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDTO)
    answers: CreateAnswerDTO[];
}
