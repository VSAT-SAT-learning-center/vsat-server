import { Module } from '@nestjs/common';
import { EvaluateCriteriaService } from './evaluate-criteria.service';
import { EvaluateCriteriaController } from './evaluate-criteria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluateCriteria } from 'src/database/entities/evaluatecriteria.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EvaluateCriteria])],
    providers: [EvaluateCriteriaService],
    controllers: [EvaluateCriteriaController],
})
export class EvaluateCriteriaModule {}
