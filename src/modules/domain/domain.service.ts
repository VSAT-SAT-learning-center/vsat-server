import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { Domain } from 'src/database/entities/domain.entity';
@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
  ) {}

  async findAll(paginationOptions: PaginationOptionsDto) {
    const { page, pageSize, sortBy, sortOrder } = paginationOptions;
    const skip = (page - 1) * pageSize;

    const queryBuilder = this.domainRepository.createQueryBuilder('domain')
      .leftJoinAndSelect('domain.section', 'section')
      .orderBy(`domain.${sortBy}`, sortOrder)
      .skip(skip)
      .take(pageSize);

    const [data, totalItems] = await queryBuilder.getManyAndCount();

    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async findOne(id: string) {
    return await this.domainRepository.findOne({ 
      where: { id },
      relations: ['section'] });
  }

  async create(createDomainDto: CreateDomainDto) {
    const domain = this.domainRepository.create(createDomainDto);
    return await this.domainRepository.save(domain);
  }

  async update(id: string, updateDomainDto: UpdateDomainDto) {
    await this.domainRepository.update(id, updateDomainDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    await this.domainRepository.delete(id);
    return { deleted: true };
  }
}
