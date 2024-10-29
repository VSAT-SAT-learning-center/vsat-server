import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitLevelDto } from './dto/create-unitlevel.dto';
import { UpdateUnitLevelDto } from './dto/update-unitlevel.dto';
import { UnitLevel } from 'src/database/entities/unitlevel.entity';
import { BaseService } from '../base/base.service';

@Injectable()
export class UnitLevelService extends BaseService<UnitLevel> {
  constructor(
    @InjectRepository(UnitLevel)
    private readonly unitLevelRepository: Repository<UnitLevel>,
  ) {
    super(unitLevelRepository);
  }
}