import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { Domain } from 'src/database/entities/domain.entity';
import { Section } from 'src/database/entities/section.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Module({
  imports: [TypeOrmModule.forFeature([Domain, Section])],
  providers: [DomainService, PaginationService],
  controllers: [DomainController],
})
export class DomainModule {}
