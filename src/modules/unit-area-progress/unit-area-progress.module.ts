import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { UnitAreaProgressController } from './unit-area-progress.controller';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([UnitAreaProgress]), LessonProgressService],
  providers: [UnitAreaProgressService],
  controllers: [UnitAreaProgressController],
  exports: [UnitAreaProgressService],
})
export class UnitAreaProgressModule {}
