import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluateCriteria } from 'src/database/entities/evaluatecriteria.entity';
import { Repository } from 'typeorm';
import { EvaluateCriteriaResponseDto } from './dto/evaluate-criteria.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class EvaluateCriteriaService {
    constructor(
        @InjectRepository(EvaluateCriteria)
        private readonly evaluateCriteriaRepository: Repository<EvaluateCriteria>,
    ) {}

    async getAllEvaluateCriteria(
        evaluateApplicateTo: string,
    ): Promise<EvaluateCriteriaResponseDto[]> {
        let criteria: EvaluateCriteria[];
        if (evaluateApplicateTo === 'Student') {
            criteria = await this.evaluateCriteriaRepository.find({
                where: { applicableTo: 'Student' },
                order: { name: 'ASC' },
            });
        } else if (evaluateApplicateTo === 'Teacher') {
            criteria = await this.evaluateCriteriaRepository.find({
                where: { applicableTo: 'Teacher' },
                order: { name: 'ASC' },
            });
        } else {
            criteria = await this.evaluateCriteriaRepository.find({
                order: { applicableTo: 'ASC', name: 'ASC' },
            });
        }

        return plainToInstance(EvaluateCriteriaResponseDto, criteria, {
            excludeExtraneousValues: true,
        });
    }

    async getEvaluateCriteriaById(id: string): Promise<EvaluateCriteriaResponseDto> {
        const evaluateCriteria = await this.evaluateCriteriaRepository.findOne({
            where: { id },
        });
        if (!evaluateCriteria) {
            throw new Error('Evaluate Criteria not found');
        }
        return plainToInstance(EvaluateCriteriaResponseDto, evaluateCriteria, {
            excludeExtraneousValues: true,
        });
    }
}
