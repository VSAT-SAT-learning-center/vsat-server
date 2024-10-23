import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from 'src/database/entities/unit.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { LevelModule } from '../level/level.module';
import { SectionModule } from '../section/section.module';
import { FeedbackModule } from '../feedback/feedback.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Unit]),
        LevelModule,
        SectionModule,
        FeedbackModule,
    ],
    controllers: [UnitController],
    providers: [UnitService],
    exports: [UnitService],
})
export class UnitModule {}
