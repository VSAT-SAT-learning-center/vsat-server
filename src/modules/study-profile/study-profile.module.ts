import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Account } from 'src/database/entities/account.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { StudyProfileService } from './study-profile.service';
import { StudyProfileController } from './study-profile.controller';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StudyProfile, Account, TargetLearning])],
    providers: [StudyProfileService],
    controllers: [StudyProfileController],
    exports: [StudyProfileService],
})
export class StudyProfileModule {}
