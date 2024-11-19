import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';
import { UnitModule } from '../unit/unit.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';
import { TargetLearningModule } from '../target-learning/target-learning.module';
import { TargetLearningDetailModule } from '../target-learning-detail/target-learning-detail.module';
import { Unit } from 'src/database/entities/unit.entity';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UnitProgress, Unit, TargetLearningDetail]),
        forwardRef(() => TargetLearningModule),
        forwardRef(() => UnitAreaModule),
        forwardRef(() => UnitAreaProgressModule),
        forwardRef(() => UnitModule),
    ],
    providers: [UnitProgressService],
    controllers: [UnitProgressController],
    exports: [UnitProgressService],
})
export class UnitProgressModule {}
