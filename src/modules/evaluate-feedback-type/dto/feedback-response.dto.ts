import { Expose } from 'class-transformer';
import { AccountDto } from 'src/common/dto/common.dto';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';

export class FeedbackResponseDto {
    @Expose()
    id: string;

    @Expose()
    createdat: Date;

    @Expose()
    updatedat: Date;

    @Expose()
    narrativeFeedback?: string;

    @Expose()
    reason?: string;

    @Expose()
    evaluateFeedbackType: EvaluateFeedbackType;

    @Expose()
    accountFrom: AccountDto;

}
