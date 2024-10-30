import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateQuizAnswerDTO {
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
