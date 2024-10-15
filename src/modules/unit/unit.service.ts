import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BaseService } from '../base/base.service';
import { SectionService } from '../section/section.service';
import { LevelService } from '../level/level.service';

@Injectable()
export class UnitService extends BaseService<Unit> {
    constructor(
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        private readonly sectionService: SectionService,
        private readonly levelService: LevelService,
    ) {
        super(unitRepository);
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

        const level = await this.levelService.findById(levelId);
        if (!levelId) {
            throw new Error('Level not found');
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

        const level = await this.levelService.findById(levelId);
        if (!levelId) {
            throw new Error('Level not found');
        }

        const updatedUnit = this.unitRepository.save({
            ...unit,
            ...unitData,
            section: section,
            level: level,
        });

        return updatedUnit;
    }

    async updateUnitStatus(id: string, updateStatusUnitDto: UpdateUnitDto): Promise<Unit> {
        
        const updateUnit = updateStatusUnitDto;

        const unit = await this.findOne(id);
        if (!unit) {
            throw new Error('Unit not found');
        }

        const updatedUnit = await this.unitRepository.save({
            ...unit,
            updateUnit
        });

        return updatedUnit;
    }
}
