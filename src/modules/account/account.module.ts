import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    controllers: [AccountController],
    providers: [AccountService],
})
export class AccountModule {}
