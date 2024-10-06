import { IsUUID, IsNotEmpty } from 'class-validator';

export class CheckAnswerDTO {
    @IsNotEmpty()
    @IsUUID()
    questionId: string;

    @IsNotEmpty()
    @IsUUID()
    answerId: string;
}
