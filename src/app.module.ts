import { Module } from '@nestjs/common';
import { AuthModule } from '../src/modules/auth/auth.module'
import { AuthController } from './modules/auth/auth.controller';
import { AuthService } from './modules/auth/auth.service';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AppModule {}
