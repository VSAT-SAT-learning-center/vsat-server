import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
  ) {}

  create(createUnitDto: CreateUnitDto): Promise<Unit> {
    const unit = this.unitRepository.create(createUnitDto);
    return this.unitRepository.save(unit);
  }

  findAll(): Promise<Unit[]> {
    return this.unitRepository.find();
  }

  findOne(id: string): Promise<Unit> {
    return this.unitRepository.findOne({ where: { id } });
  }

  update(id: string, updateUnitDto: UpdateUnitDto): Promise<Unit> {
    return this.unitRepository.save({ ...updateUnitDto, id });
  }

  remove(id: string): Promise<void> {
    return this.unitRepository.delete(id).then(() => {});
  }
}
