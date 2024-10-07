import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';

@Injectable()
export class UnitAreaService extends BaseService<UnitArea> {
    constructor(
        @InjectRepository(UnitArea)
        unitAreaRepository: Repository<UnitArea>,
        paginationService: PaginationService,
    ) {
        super(unitAreaRepository, paginationService);
    }
}
