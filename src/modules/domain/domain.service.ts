import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { Domain } from 'src/database/entities/domain.entity';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { DomainDto } from './dto/domain.dto';
@Injectable()
export class DomainService extends BaseService<Domain> {
  constructor(
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>
  ) {
    super(domainRepository); 
  }

  async getDomainsBySectionId(sectionId: string): Promise<DomainDto[]> {
    // Fetch domains by section ID
    const domains = await this.domainRepository.find({ where: { section: { id: sectionId } } });

    if (!domains || domains.length === 0) {
      throw new NotFoundException(`No domains found for section ID ${sectionId}`);
    }

    // Map the Domain entities to DomainDto
    return domains.map(domain => ({
      id: domain.id,
      name: domain.content,  // Assuming 'name' is the desired field to return
    }));
  }
  
}
