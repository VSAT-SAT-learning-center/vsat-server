import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { TargetLearningDetail } from 'src/database/entities/targetlearningdetail.entity';
import { Repository } from 'typeorm';
import { CreateTargetLearningDetailDto } from './dto/create-targetlearningdetail.dto';

@Injectable()
export class TargetLearningDetailService {
    constructor(
        @InjectRepository(TargetLearningDetail)
        private readonly targetLearningDetailRepository: Repository<TargetLearningDetail>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
    ) {}

    async save(
        createTargetLearningDto: CreateTargetLearningDetailDto,
        targetLearningId: string,
    ): Promise<TargetLearningDetail> {
        const level = await this.levelRepository.findOne({
            where: { id: createTargetLearningDto.levelId },
        });

        const section = await this.sectionRepository.findOne({
            where: { id: createTargetLearningDto.sectionId },
        });

        if (!level) {
            throw new NotFoundException('Level is not found');
        }
        if (!section) {
            throw new NotFoundException('Section is not found');
        }

        const createTargetLearning = await this.targetLearningDetailRepository.create({
            level: level,
            section: section,
            targetlearning: { id: targetLearningId },
        });

        const saveTargetLEarning =
            await this.targetLearningDetailRepository.save(createTargetLearning);

        return saveTargetLEarning;
    }
}
