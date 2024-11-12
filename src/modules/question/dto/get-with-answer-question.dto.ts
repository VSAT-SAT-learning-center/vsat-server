import { Expose, Type } from 'class-transformer';
import { BaseDTO } from 'src/common/dto/base.dto';
import { GetAnswerDTO } from 'src/modules/answer/dto/get-answer.dto';

export class GetQuestionWithAnswerDTO extends BaseDTO {
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

    @Expose()
    IsSingleChoiceQuestion: boolean;
}
