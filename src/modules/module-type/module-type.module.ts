import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Section } from 'src/database/entities/section.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ModuleTypeService } from './module-type.service';
import { ModuleTypeController } from './module-type.controller';
import { ExamModule } from '../exam/exam.module';
import { ExamAttemptModule } from '../exam-attempt/exam-attempt.module';
import { DomainDistributionModule } from '../domain-distribution/domain-distribution.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ModuleType, Section, ExamStructure]),
        forwardRef(() => ExamModule),
        forwardRef(() => ExamAttemptModule),
        DomainDistributionModule,
    ],
    providers: [ModuleTypeService],
    controllers: [ModuleTypeController],
    exports: [ModuleTypeService],
})
export class ModuleTypeModule {}
