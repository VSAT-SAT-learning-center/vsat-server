import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { SectionService } from '../section/section.service';
import { LevelService } from '../level/level.service';
import { Level } from 'src/database/entities/level.entity';

@Injectable()
export class UnitService extends BaseService<Unit> {
    constructor(
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        private readonly sectionService: SectionService,
        private readonly levelService: LevelService,
        paginationService: PaginationService,
    ) {
        super(unitRepository, paginationService);
    }

    // async findOneWithUnitArea(id: string): Promise<Unit> {
    //     return this.findOne(id, ["UnitArea"]);
    // }

    async create(createUnitDto: CreateUnitDto): Promise<Unit> {
        const { sectionId, levelId, ...unitData } = createUnitDto;

        const section = await this.sectionService.findOneById(sectionId);
        if (!section) {
            throw new Error('Section not found');
        }

        let level = null;
        if (levelId) {
            level = await this.levelService.findOne(levelId);
            if (!level) {
                throw new Error('Level not found');
            }
        }

        const newUnit = this.unitRepository.create({
            ...unitData,
            section: section,
            level: level,
        });

        return await this.unitRepository.save(newUnit);
    }

    async update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
        const { sectionId, levelId, ...unitData } = updateUnitDto;

        const unit = await this.findOne(id);
        if (!unit) {
            throw new Error('Unit not found');
        }

        const section = await this.sectionService.findOneById(sectionId);
        if (!section) {
            throw new Error('Section not found');
        }

        let level = null;
        if (levelId) {
            level = await this.levelService.findOne(levelId);
            if (!level) {
                throw new Error('Level not found');
            }
        }

        const updatedUnit = this.unitRepository.create({
            ...unit,
            ...unitData,
            section: section,
            level: level,
        });

        return await this.unitRepository.save(updatedUnit);
    }
}
