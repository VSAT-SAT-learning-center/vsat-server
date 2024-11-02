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

    async save(
        examStructureId: string,
        createExamStructureConfigDto: CreateExamStructureConfigDto,
    ) {
        const examStructure = await this.examStructureRepository.findOne({
            where: { id: examStructureId },
        });

        const domain = await this.domainRepository.findOne({
            where: { id: createExamStructureConfigDto.domainId },
        });

        if (!examStructure) {
            throw new NotFoundException('ExamStructure is not found');
        }

        if (!domain) {
            throw new NotFoundException('Domain is not found');
        }

        const createExamstructureConfig =
            await this.examStructureConfigRepository.create({
                examStructure: examStructure,
                domain: domain,
                numberOfQuestion: createExamStructureConfigDto.numberOfQuestion,
            });

        const save = await this.examStructureConfigRepository.save(
            createExamstructureConfig,
        );
        return plainToInstance(CreateExamStructureConfigDto, save, {
            excludeExtraneousValues: true,
        });
    }
}
