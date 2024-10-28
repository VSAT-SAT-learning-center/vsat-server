import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDTO {
    @ApiProperty({
        example: 'A',
    })
    @IsString()
    @IsNotEmpty()
    label: string;

    @ApiProperty({
        example: '32/3 square units',
    })
    @IsString()
    @IsNotEmpty()
    text: string;

    @ApiProperty({
        example: true,
    })
    @IsNotEmpty()
    isCorrectAnswer: boolean;
}

export class CompleteInputDTO {
    @ApiProperty({
        example:
            'Find the area bounded by the curve y = x^2 and the line y = 4 in the first quadrant.',
    })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({
        type: [AnswerDTO],
        description: 'A list of possible answers with only one being correct',
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDTO)
    answers: AnswerDTO[];

    @ApiProperty()
    explain: string;
}

export class CompleteOutputDTO {
    @IsString()
    @IsNotEmpty()
    aiMessage: string;

    static getInstance(aiMessage: string) {
        const result = new CompleteOutputDTO();
        result.aiMessage = aiMessage;
        return result;
    }
}
