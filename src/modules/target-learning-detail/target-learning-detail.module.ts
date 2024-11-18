import { Module } from '@nestjs/common';
import { TargetLearningDetailController } from './target-learning-detail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetLearningDetailService } from './target-learning-detail.service';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';
import { Section } from 'src/database/entities/section.entity';
import { Level } from 'src/database/entities/level.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TargetLearningDetail, Level, Section])],
    providers: [TargetLearningDetailService],
    controllers: [TargetLearningDetailController],
    exports: [TargetLearningDetailService, TypeOrmModule],
})
export class TargetLearningDetailModule {}
