import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitProgressDto } from './dto/create-unitprogress.dto';
import { UpdateUnitProgressDto } from './dto/update-unitprogress.dto';
import { UnitProgress } from 'src/database/entities/unitprogress.entity';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';
import { StudyProfileService } from '../study-profile/study-profile.service';
import { UnitAreaProgressService } from '../unit-area-progress/unit-area-progress.service';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';

@Injectable()
export class UnitProgressService extends BaseService<UnitProgress> {
    constructor(
        @InjectRepository(UnitProgress)
        private readonly unitProgressRepository: Repository<UnitProgress>,
        private readonly unitService: UnitService,
        private readonly studyProfileService: StudyProfileService,
        private readonly unitAreaProgressService: UnitAreaProgressService,
    ) {
        super(unitProgressRepository); // Call super with repository and paginationService
    }

    async create(
        createUnitProgressDto: CreateUnitProgressDto,
    ): Promise<UnitProgress> {
        const { unitId, studyProfileId, ...unitProgressData } =
            createUnitProgressDto;

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new Error('Unit not found');
        }

        const studyProfile =
            await this.studyProfileService.findOne(studyProfileId);
        if (!studyProfile) {
            throw new Error('StudyProfile not found');
        }

        const newUnitProgress = this.unitProgressRepository.create({
            ...unitProgressData,
            studyProfile: studyProfile,
            unit: unit,
        });

        return await this.unitProgressRepository.save(newUnitProgress);
    }

    async update(
        id: string,
        updateUnitProgressDto: UpdateUnitProgressDto,
    ): Promise<UnitProgress> {
        const { unitId, studyProfileId, ...unitProgressData } =
            updateUnitProgressDto;

        const unitProgress = await this.findOne(id);
        if (!unitProgress) {
            throw new Error('UnitProgress not found');
        }

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new Error('Unit not found');
        }

        const studyProfile =
            await this.studyProfileService.findOne(studyProfileId);
        if (!studyProfile) {
            throw new Error('StudyProfile not found');
        }

        const updatedUnitProgress = this.unitProgressRepository.save({
            //...unit,
            ...unitProgressData,
            studyProfile: studyProfile,
            unit: unit,
        });

        return updatedUnitProgress;
    }

    
}
