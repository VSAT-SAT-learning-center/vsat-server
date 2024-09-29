import { Module } from '@nestjs/common';
import { UnitLevelService } from './unit-level.service';
import { UnitLevelController } from './unit-level.controller';

@Module({
  providers: [UnitLevelService],
  controllers: [UnitLevelController]
})
export class UnitLevelModule {}
