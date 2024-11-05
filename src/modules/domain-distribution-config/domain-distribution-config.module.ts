import { Module } from '@nestjs/common';
import { DomainDistributionConfigController } from './domain-distribution-config.controller';
import { DomainDistributionConfigService } from './domain-distribution-config.service';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([DomainDistributionConfig])],
    providers: [DomainDistributionConfigService],
    controllers: [DomainDistributionConfigController],
})
export class DomainDistributionConfigModule {}
