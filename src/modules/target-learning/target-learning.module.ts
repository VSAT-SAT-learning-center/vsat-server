import { Module } from '@nestjs/common';
import { TargetLearningService } from './target-learning.service';
import { TargetLearningController } from './target-learning.controller';

@Module({
  providers: [TargetLearningService],
  controllers: [TargetLearningController]
})
export class TargetLearningModule {}
