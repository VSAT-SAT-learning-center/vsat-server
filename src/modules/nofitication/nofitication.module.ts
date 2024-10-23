import { Module } from '@nestjs/common';
import { NofiticationService } from './nofitication.service';
import { NofiticationController } from './nofitication.controller';

@Module({
  providers: [NofiticationService],
  controllers: [NofiticationController]
})
export class NofiticationModule {}
