import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/database/entities/role.entity';
import { StudyProfileService } from '../study-profile/study-profile.service';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Role, Account, StudyProfile])],
    controllers: [AccountController],
    providers: [AccountService, JwtService, StudyProfileService],
    exports: [AccountService]
})
export class AccountModule {}
