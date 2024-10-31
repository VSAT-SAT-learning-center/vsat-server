import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

import { BaseService } from '../base/base.service';

@Injectable()
export class TargetLearningService extends BaseService<TargetLearning> {
    constructor(
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
    ) {
        super(targetLearningRepository);
    }

    async save(createTargetLearningDto: CreateTargetLearningDto): Promise<CreateTargetLearningDto>{
        const level = await this.targetLearningRepository.findOne({
            where: { id: createTargetLearningDto.levelId },
        });

        const section = await this.targetLearningRepository.findOne({
            where: { id: createTargetLearningDto.sectionId },
        });

        const studyProfile = await this.targetLearningRepository.findOne({
            where: { id: createTargetLearningDto.studyProfileId },
        });

        if (!level) {
            throw new NotFoundException('Level is not found');
        }
        if (!section) {
            throw new NotFoundException('Section is not found');
        }
        if (!studyProfile) {
            throw new NotFoundException('StudyProfile is not found');
        }

        return await this.targetLearningRepository.save(createTargetLearningDto);
    }
}
