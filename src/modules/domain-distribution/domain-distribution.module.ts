import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from 'src/database/entities/domain.entity';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { DomainDistributionService } from './domain-distribution.service';
import { DomainDistributionController } from './domain-distribution.controller';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([DomainDistribution, Domain, ModuleType])],
  providers: [DomainDistributionService, PaginationService],
  controllers: [DomainDistributionController],
})
export class DomainDistributionModule {}
