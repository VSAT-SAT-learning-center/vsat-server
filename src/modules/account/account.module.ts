import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/database/entities/role.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Role, Account])],
    controllers: [AccountController],
    providers: [AccountService, JwtService],
})
export class AccountModule {}
