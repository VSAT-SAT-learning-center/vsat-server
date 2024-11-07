import { Module } from '@nestjs/common';
import { ExamSemesterService } from './exam-semester.service';
import { ExamSemesterController } from './exam-semester.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { DomainDistributionConfigModule } from '../domain-distribution-config/domain-distribution-config.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([ExamSemester, DomainDistributionConfig, Domain]),
        DomainDistributionConfigModule,
    ],
    providers: [ExamSemesterService],
    controllers: [ExamSemesterController],
})
export class ExamSemesterModule {}
