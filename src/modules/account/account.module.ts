import { forwardRef, Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/database/entities/account.entity';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/database/entities/role.entity';
import { StudyProfileModule } from '../study-profile/study-profile.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Role, Account]),
        forwardRef(() => StudyProfileModule), // Import StudyProfileModule
    ],
    controllers: [AccountController],
    providers: [AccountService, JwtService], // Remove StudyProfileService
    exports: [AccountService],
})
export class AccountModule {}
