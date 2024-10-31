import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateQuizConfigDto } from './dto/create-quizconfig.dto';
import { UpdateQuizConfigDto } from './dto/update-quizconfig.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { BaseService } from '../base/base.service';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';

@Injectable()
export class QuizConfigService extends BaseService<QuizConfig> {
    constructor(
        @InjectRepository(QuizConfig)
        private readonly quizConfigRepository: Repository<QuizConfig>,
    ) {
        super(quizConfigRepository);
    }

    async findConfigsByUnitId(unitId: string): Promise<QuizConfig[]> {
        return this.quizConfigRepository.find({
            where: { unit: { id: unitId } },
            relations: ['skill'],
        });
    }

    
    
    
}
