import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyProfileService } from './study-profile.service';
import { StudyProfileController } from './study-profile.controller';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { Account } from 'src/database/entities/account.entity';
import { AccountModule } from '../account/account.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([StudyProfile, TargetLearning, Account]),
        forwardRef(() => AccountModule),
    ],
    providers: [StudyProfileService],
    controllers: [StudyProfileController],
    exports: [StudyProfileService],
})
export class StudyProfileModule {}
