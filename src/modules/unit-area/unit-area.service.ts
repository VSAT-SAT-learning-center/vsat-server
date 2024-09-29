import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitArea } from 'src/database/entities/unitarea.entity';
import { CreateUnitAreaDto } from './dto/create-unitarea.dto';
import { UpdateUnitAreaDto } from './dto/update-unitarea.dto';

@Injectable()
export class UnitAreaService {
  constructor(
    @InjectRepository(UnitArea)
    private readonly unitAreaRepository: Repository<UnitArea>,
  ) {}

  create(createUnitAreaDto: CreateUnitAreaDto): Promise<UnitArea> {
    const unitArea = this.unitAreaRepository.create(createUnitAreaDto);
    return this.unitAreaRepository.save(unitArea);
  }

  findAll(): Promise<UnitArea[]> {
    return this.unitAreaRepository.find();
  }

  findOne(id: string): Promise<UnitArea> {
    return this.unitAreaRepository.findOne({ where: { id } });
  }

  update(id: string, updateUnitAreaDto: UpdateUnitAreaDto): Promise<UnitArea> {
    return this.unitAreaRepository.save({ ...updateUnitAreaDto, id });
  }

  remove(id: string): Promise<void> {
    return this.unitAreaRepository.delete(id).then(() => {});
  }
}


