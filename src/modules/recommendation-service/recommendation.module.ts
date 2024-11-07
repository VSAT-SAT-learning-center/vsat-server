import { forwardRef, Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { QuizAttemptModule } from '../quiz-attempt/quiz-attempt.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';

@Module({
    imports: [
      forwardRef(() => QuizAttemptModule),
      UnitAreaModule],
    providers: [RecommendationService],
    controllers: [RecommendationController],
    exports: [RecommendationService]
})
export class RecommendationModule {}
