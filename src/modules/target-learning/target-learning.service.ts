import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTargetLearningDto } from './dto/create-targetlearning.dto';
import { UpdateTargetLearningDto } from './dto/update-targetlearning.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

import { BaseService } from '../base/base.service';
import { plainToInstance } from 'class-transformer';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';

@Injectable()
export class TargetLearningService extends BaseService<TargetLearning> {
    constructor(
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
    ) {
        super(targetLearningRepository);
    }

    async save(
        createTargetLearningDto: CreateTargetLearningDto,
        studyProfileId: string,
    ): Promise<TargetLearning> {
        const level = await this.levelRepository.findOne({
            where: { id: createTargetLearningDto.levelId },
        });

        const section = await this.sectionRepository.findOne({
            where: { id: createTargetLearningDto.sectionId },
        });

        const studyProfile = await this.studyProfileRepository.findOne({
            where: { id: studyProfileId },
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

        const createTargetLearning = await this.targetLearningRepository.create({
            level: level,
            section: section,
            studyProfile: studyProfile,
        });

        const saveTargetLEarning =
            await this.targetLearningRepository.save(createTargetLearning);

        return saveTargetLEarning;
    }

    async getTargetLearningByStudyProfile(studyProfileId: string) {
        const target = await this.targetLearningRepository.findOne({
            where: { studyProfile: { id: studyProfileId } },
            relations: ['unitprogress'],
        });

        return target;
    }
}
