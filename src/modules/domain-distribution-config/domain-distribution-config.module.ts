import { Module } from '@nestjs/common';
import { DomainDistributionConfigController } from './domain-distribution-config.controller';
import { DomainDistributionConfigService } from './domain-distribution-config.service';

@Module({
    providers: [DomainDistributionConfigService],
    controllers: [DomainDistributionConfigController],
})
export class DomainDistributionConfigModule {}
