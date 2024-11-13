import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { TargetLearningService } from './target-learning.service';
import { TargetLearningController } from './target-learning.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TargetLearning, Level, Section, StudyProfile])],
    providers: [TargetLearningService, PaginationService],
    controllers: [TargetLearningController],
    exports: [TargetLearningService],
})
export class TargetLearningModule {}
