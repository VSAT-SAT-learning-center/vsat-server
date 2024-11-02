import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Section } from 'src/database/entities/section.entity';
import { ModuleTypeService } from './module-type.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ModuleTypeController } from './module-type.controller';
import { DomainDistributionModule } from '../domain-distribution/domain-distribution.module';

@Module({
    imports: [TypeOrmModule.forFeature([ModuleType, Section, ExamStructure]), DomainDistributionModule],
    providers: [ModuleTypeService, PaginationService],
    controllers: [ModuleTypeController],
    exports: [ModuleTypeService],
})
export class ModuleTypeModule {}
