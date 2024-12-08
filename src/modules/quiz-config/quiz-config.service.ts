import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import { QuizConfig } from 'src/database/entities/quizconfig.entity';
import {
    CreateQuizConfigForUnitDto,
    SkillConfigDto,
} from './dto/create-quizconfig.dto';

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

    async createQuizConfigForUnit(
        createQuizConfigForUnitDto: CreateQuizConfigForUnitDto,
    ): Promise<QuizConfig[]> {
        const { unitId, skillConfigs } = createQuizConfigForUnitDto;

        const quizConfigsToSave = skillConfigs.map(
            (skillConfig: SkillConfigDto) => {
                const quizConfig = new QuizConfig();
                quizConfig.unit = { id: unitId } as any;
                quizConfig.skill = { id: skillConfig.skillId } as any;
                quizConfig.totalquestion = skillConfig.totalQuestions;
                return quizConfig;
            },
        );
        
        return this.quizConfigRepository.save(quizConfigsToSave);
    }
}
