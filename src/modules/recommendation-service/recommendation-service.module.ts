import { Module } from '@nestjs/common';
import { RecommendationServiceService } from './recommendation-service.service';
import { RecommendationServiceController } from './recommendation-service.controller';

@Module({
  providers: [RecommendationServiceService],
  controllers: [RecommendationServiceController]
})
export class RecommendationServiceModule {}
