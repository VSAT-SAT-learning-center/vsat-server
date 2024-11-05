import { Module } from '@nestjs/common';
import { DomainDistributionConfigController } from './domain-distribution-config.controller';
import { DomainDistributionConfigService } from './domain-distribution-config.service';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'src/database/entities/domain.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DomainDistributionConfig, Domain])],
    providers: [DomainDistributionConfigService],
    controllers: [DomainDistributionConfigController],
    exports: [DomainDistributionConfigService],
})
export class DomainDistributionConfigModule {}
