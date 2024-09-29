import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Unit } from 'src/database/entities/unit.entity';
import { Repository } from 'typeorm';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationOptionsDto } from 'src/common/helpers/dto/pagination-options.dto.ts';

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

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;

    // Tính toán `skip` và `take` cho phân trang
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.unitRepository.createQueryBuilder('unit')
      .orderBy(`unit.${sortBy}`, sortOrder)
      .skip(skip)
      .take(pageSize);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
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
