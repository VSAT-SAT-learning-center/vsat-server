import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateAnswerDTO {
    @ApiProperty({
        description: 'Nhãn của câu trả lời',
        example: 'A',
    })
    @IsNotEmpty()
    label: string;

    @ApiProperty({
        description: 'Nội dung của câu trả lời',
        example: '2',
    })
    @IsNotEmpty()
    text: string;

    @ApiProperty({
        description: 'Xác định câu trả lời có đúng hay không',
        example: true,
    })
    @IsNotEmpty()
    isCorrectAnswer: boolean;
}

class CreateMultipleAnswersDTO {
    @ApiProperty({ type: [CreateAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDTO)
    answers: CreateAnswerDTO[];
}
