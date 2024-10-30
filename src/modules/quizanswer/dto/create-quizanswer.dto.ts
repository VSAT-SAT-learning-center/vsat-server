import { ApiProperty } from '@nestjs/swagger';
import { CreateQuiz } from './../../quizquestion/dto/create-quiz.dto';
import { IsNotEmpty } from 'class-validator';

export class CreateQuizAnswerDTO {
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
