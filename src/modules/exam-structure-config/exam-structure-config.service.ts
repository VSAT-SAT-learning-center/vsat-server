import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamStructureConfig } from 'src/database/entities/examstructureconfig.entity';
import { Repository } from 'typeorm';
import { CreateExamStructureConfigDto } from './dto/create-exam-structure-config.dto';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExamStructureConfigService {
    constructor(
        @InjectRepository(ExamStructureConfig)
        private readonly examStructureConfigRepository: Repository<ExamStructureConfig>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
    ) {}

    async save(examStructureId: string, createExamStructureConfigDtos: CreateExamStructureConfigDto[]) {
        const examStructure = await this.examStructureRepository.findOne({
            where: { id: examStructureId },
        });
    
        if (!examStructure) {
            throw new NotFoundException('ExamStructure is not found');
        }
    
        const configsToSave = [];
    
        for (const configDto of createExamStructureConfigDtos) {
            const domain = await this.domainRepository.findOne({
                where: { content: configDto.domain },
            });
    
            if (!domain) {
                throw new NotFoundException(`Domain '${configDto.domain}' is not found`);
            }
    
            const config = this.examStructureConfigRepository.create({
                examStructure: examStructure,
                domain: domain,
                numberOfQuestion: configDto.numberOfQuestion,
            });
    
            configsToSave.push(config);
        }
    
        const savedConfigs = await this.examStructureConfigRepository.save(configsToSave);
        
        return plainToInstance(CreateExamStructureConfigDto, savedConfigs, {
            excludeExtraneousValues: true,
        });
    }
    
}
