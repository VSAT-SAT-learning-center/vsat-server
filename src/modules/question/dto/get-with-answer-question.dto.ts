import { Expose, Type } from 'class-transformer';
import { GetAnswerDTO } from 'src/modules/answer/dto/get-answer.dto';

export class GetQuestionWithAnswerDTO {
    @Expose()
    id: string;

    @Expose()
    content: string;

    @Expose()
    correctanswer: string;

    @Expose()
    explain: string;

    @Expose()
    @Type(() => GetAnswerDTO)
    answers: GetAnswerDTO[];

    
}
