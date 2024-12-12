import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Domain } from 'src/database/entities/domain.entity';
import { BaseService } from '../base/base.service';
import { DomainDto } from './dto/domain.dto';
@Injectable()
export class DomainService extends BaseService<Domain> {
    constructor(
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
    ) {
        super(domainRepository);
    }

    async getDomainsBySectionId(sectionId: string): Promise<DomainDto[]> {
        
        const domains = await this.domainRepository.find({ where: { section: { id: sectionId } } });

        if (!domains || domains.length === 0) {
            throw new NotFoundException(`No domains found for section ID ${sectionId}`);
        }

        
        return domains.map((domain) => ({
            id: domain.id,
            name: domain.content, 
        }));
    }
}
