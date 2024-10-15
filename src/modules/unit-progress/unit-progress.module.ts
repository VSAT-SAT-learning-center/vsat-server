import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { Unit } from 'src/database/entities/unit.entity';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { UnitProgressService } from './unit-progress.service';
import { UnitProgressController } from './unit-progress.controller';
import { StudyProfileModule } from '../study-profile/study-profile.module';
import { UnitModule } from '../unit/unit.module';
import { UnitAreaModule } from '../unit-area/unit-area.module';
import { UnitAreaProgressModule } from '../unit-area-progress/unit-area-progress.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UnitProgress]),
        StudyProfileModule,
        UnitModule,
        forwardRef(() => UnitAreaProgressModule),
    ],
    providers: [UnitProgressService],
    controllers: [UnitProgressController],
    exports: [UnitProgressService],
})
export class UnitProgressModule {}
