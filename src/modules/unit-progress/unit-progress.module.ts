import { Module } from '@nestjs/common';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';

@Module({
  providers: [UnitProgressService],
  controllers: [UnitProgressController]
})
export class UnitProgressModule {}
