import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreateAnswerDTO {
    @ApiProperty({
        description: 'ID của câu hỏi liên quan đến câu trả lời',
        example: 'd07b7a76-b7c7-45f7-bdc5-e2a5b2c4c256',
    })
    @IsNotEmpty()
    @IsUUID()
    questionId: string;

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
}

export class CreateMultipleAnswersDTO {
    @ApiProperty({ type: [CreateAnswerDTO] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDTO)
    answers: CreateAnswerDTO[];
}
