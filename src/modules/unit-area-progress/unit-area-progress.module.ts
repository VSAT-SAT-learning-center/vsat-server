import { Module } from '@nestjs/common';
import { UnitAreaProgressService } from './unit-area-progress.service';
import { UnitAreaProgressController } from './unit-area-progress.controller';

@Module({
  providers: [UnitAreaProgressService],
  controllers: [UnitAreaProgressController]
})
export class UnitAreaProgressModule {}
