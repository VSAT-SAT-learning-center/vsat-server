import { forwardRef, Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { QuizAttemptModule } from '../quiz-attempt/quiz-attempt.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { UnitProgressModule } from '../unit-progress/unit-progress.module';

@Module({
    imports: [forwardRef(() => QuizAttemptModule), UnitAreaModule, UnitProgressModule],
    providers: [RecommendationService],
    exports: [RecommendationService],
})
export class RecommendationModule {}
