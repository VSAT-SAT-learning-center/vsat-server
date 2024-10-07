import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitService } from '../unit/unit.service';

@Injectable()
export class UnitAreaService extends BaseService<UnitArea> {
    constructor(
        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,
        private readonly unitService: UnitService,
        paginationService: PaginationService,
    ) {
        super(unitAreaRepository, paginationService);
    }

    async create(createUnitAreaDto: CreateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = createUnitAreaDto;

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new Error('Section not found');
        }

        const newUnitArea = this.unitAreaRepository.create({
            ...unitAreaData,
            unit: unit,
        });

        return await this.unitAreaRepository.save(newUnitArea);
    }

    async update(id: string, updateUnitAreaDto: UpdateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = updateUnitAreaDto;

        const unitArea = await this.findOne(id);
        if (!unitArea) {
            throw new Error('UnitArea not found');
        }

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new Error('Section not found');
        }

        const updatedUnitArea = this.unitAreaRepository.create({
            ...unitArea,
            ...unitAreaData, // Update only the fields provided
            unit: unit,
        });

        return await this.unitAreaRepository.save(updatedUnitArea);
    }
}
