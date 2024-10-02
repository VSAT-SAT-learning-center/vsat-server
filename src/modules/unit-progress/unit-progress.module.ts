import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { UnitAreaProgressController } from '../unit-area-progress/unit-area-progress.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UnitProgress, StudyProfile, Unit])],
  providers: [UnitProgressService, PaginationService],
  controllers: [UnitAreaProgressController],
})
export class UnitProgressModule {}
