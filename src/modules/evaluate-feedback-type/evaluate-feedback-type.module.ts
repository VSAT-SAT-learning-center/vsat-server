import { Module } from '@nestjs/common';
import { EvaluateFeedbackController } from './evaluate-feedback.controller';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluateFeedbackService } from './evaluate-feedback.service';
import { FeedbackCriteriaScores } from 'src/database/entities/feedbackcriteriascores.entity';
import { Account } from 'src/database/entities/account.entity';
import { NotificationModule } from 'src/modules/notification/notification.module';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EvaluateFeedback,
            FeedbackCriteriaScores,
            Account,
            StudyProfile,
        ]),
        NotificationModule,
    ],
    providers: [EvaluateFeedbackService],
    controllers: [EvaluateFeedbackController],
})
export class EvaluateFeedbackModule {}
