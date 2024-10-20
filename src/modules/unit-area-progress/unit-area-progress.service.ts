import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitAreaProgressDto } from './dto/create-unitareaprogress.dto';
import { UpdateUnitAreaProgressDto } from './dto/update-unitareaprogress.dto';
import { UnitAreaProgress } from 'src/database/entities/unitareaprogress.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { LessonProgressService } from '../lesson-progress/lesson-progress.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
//
@Injectable()
export class UnitAreaProgressService extends BaseService<UnitAreaProgress> {
    constructor(
        @InjectRepository(UnitAreaProgress)
        private readonly unitAreaProgressRepository: Repository<UnitAreaProgress>,
        private readonly unitAreaService: UnitAreaService,
        private readonly unitProgressService: UnitProgressService,
      
        @Inject(forwardRef(() => LessonProgressService))
        private readonly lessonProgressService: LessonProgressService,
    ) {
        super(unitAreaProgressRepository);
    }

    async updateUnitAreaProgress(
        unitProgressId: string,
        unitAreaId: string,
    ): Promise<UnitAreaProgress> {
        const progress =
            await this.lessonProgressService.calculateUnitAreaProgress(
                unitProgressId,
            );

        let unitAreaProgress = await this.unitAreaProgressRepository.findOne({
            where: {
                unitArea: { id: unitAreaId },
                unitProgress: { id: unitProgressId },
            },
        });

        if (unitAreaProgress) {
            unitAreaProgress.progress = progress;
        } else {
            unitAreaProgress = this.unitAreaProgressRepository.create({
                unitArea: { id: unitAreaId },
                unitProgress: { id: unitProgressId },
                progress,
            });
        }

        return this.unitAreaProgressRepository.save(unitAreaProgress);
    }

    async calculateUnitProgress(unitProgressId: string): Promise<number> {
        const unitAreas = await this.unitAreaProgressRepository.find({
            where: { unitProgress: { id: unitProgressId } },
        });

        if (unitAreas.length === 0) return 0;

        const completedUnitAreas = unitAreas.filter(
            (ua) => ua.progress === 100,
        ).length;
        return (completedUnitAreas / unitAreas.length) * 100;
    }

    async create(
        createUnitAreaProgressDto: CreateUnitAreaProgressDto,
    ): Promise<UnitAreaProgress> {
        const { unitAreaId, unitProgressId, ...unitAreaProgressData } =
            createUnitAreaProgressDto;

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unitProgress =
            await this.unitProgressService.findOneById(unitProgressId);
        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const newUnitAreaProgress = this.unitAreaProgressRepository.create({
            ...unitAreaProgressData,
            unitProgress: unitProgress,
            unitArea: unitArea,
        });

        return await this.unitAreaProgressRepository.save(newUnitAreaProgress);
    }

    async update(
        id: string,
        updateUnitAreaProgressDto: UpdateUnitAreaProgressDto,
    ): Promise<UnitAreaProgress> {
        const { unitAreaId, unitProgressId, ...unitAreaProgressData } =
            updateUnitAreaProgressDto;

        const unitAreaProgress = await this.findOneById(id);
        if (!unitAreaProgress) {
            throw new NotFoundException('UnitAreaProgress not found');
        }

        const unitArea = await this.unitAreaService.findOneById(unitAreaId);
        if (!unitArea) {
            throw new NotFoundException('UnitArea not found');
        }

        const unitProgress =
            await this.unitProgressService.findOneById(unitProgressId);

        if (!unitProgress) {
            throw new NotFoundException('UnitProgress not found');
        }

        const updatedUnitAreaProgress = this.unitAreaProgressRepository.save({
            //...unit,
            ...unitAreaProgressData,
            unitProgress: unitProgress,
            unitArea: unitArea,
        
        });
        return updatedUnitAreaProgress
    }
}

