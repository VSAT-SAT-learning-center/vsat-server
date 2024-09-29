import { Module } from '@nestjs/common';
import { ModuleTypeService } from './module-type.service';
import { ModuleTypeController } from './module-type.controller';

@Module({
  providers: [ModuleTypeService],
  controllers: [ModuleTypeController]
})
export class ModuleTypeModule {}
