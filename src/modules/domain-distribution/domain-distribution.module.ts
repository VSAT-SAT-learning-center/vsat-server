import { Module } from '@nestjs/common';
import { DomainDistributionService } from './domain-distribution.service';
import { DomainDistributionController } from './domain-distribution.controller';

@Module({
  providers: [DomainDistributionService],
  controllers: [DomainDistributionController]
})
export class DomainDistributionModule {}
