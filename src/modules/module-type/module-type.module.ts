import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Section } from 'src/database/entities/section.entity';
import { ModuleTypeService } from './module-type.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ModuleTypeController } from './module-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ModuleType, Section, ExamStructure])],
  providers: [ModuleTypeService, PaginationService],
  controllers: [ModuleTypeController],
})
export class ModuleTypeModule {}
