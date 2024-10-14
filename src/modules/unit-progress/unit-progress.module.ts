import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';
import { StudyProfileModule } from '../study-profile/study-profile.module';
import { UnitModule } from '../unit/unit.module';

@Module({
  imports: [TypeOrmModule.forFeature([UnitProgress]), StudyProfileModule, UnitModule],
  providers: [UnitProgressService, PaginationService],
  controllers: [UnitProgressController],
  exports: [UnitProgressService]
})
export class UnitProgressModule {}
