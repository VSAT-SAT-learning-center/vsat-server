import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { UnitService } from '../unit/unit.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';

@Injectable()
export class UnitAreaService extends BaseService<UnitArea> {
    constructor(
        @InjectRepository(UnitArea)
        private readonly unitAreaRepository: Repository<UnitArea>,
        private readonly unitService: UnitService,
    ) {
        super(unitAreaRepository);
    }

    async findAllWithLessons(
        paginationOptions: PaginationOptionsDto,
    ): Promise<{ data: UnitArea[]; totalItems: number; totalPages: number }> {
        
        //const filter = unitId ? { unit: { id: unitId } } : {};
        //paginationOptions.filter = filter;
        // Fetch unit areas with lessons as relation
        paginationOptions.relations = ['lessons']; // Đảm bảo bao gồm quan hệ lessons
        return this.findAll(paginationOptions);
    }

    async create(createUnitAreaDto: CreateUnitAreaDto): Promise<UnitArea> {
        const { unitId, ...unitAreaData } = createUnitAreaDto;

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
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
            throw new NotFoundException('UnitArea not found');
        }

        const unit = await this.unitService.findOne(unitId);
        if (!unit) {
            throw new NotFoundException('Unit not found');
        }

        const updatedUnitArea = await this.unitAreaRepository.save({
            ...unitArea,
            ...unitAreaData, // Update only the fields provided
            unit: unit,
        });

        return updatedUnitArea;
    }
}
