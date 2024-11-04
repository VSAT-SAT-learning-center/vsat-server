import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamStructureDto } from './dto/create-examstructure.dto';
import { UpdateExamStructureDto } from './dto/update-examstructure.dto';
import { BaseService } from '../base/base.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { plainToInstance } from 'class-transformer';
import { GetExamStructureDto } from './dto/get-examstructure.dto';
import { ExamStructureConfigService } from '../exam-structure-config/exam-structure-config.service';
import { ExamStructureType } from 'src/database/entities/examstructuretype.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { ModuleTypeService } from '../module-type/module-type.service';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';

@Injectable()
export class ExamStructureService {
    constructor(
        @InjectRepository(ExamStructure)
        private readonly repository: Repository<ExamStructure>,
        @InjectRepository(ExamStructureType)
        private readonly examStructureTypeRepository: Repository<ExamStructureType>,
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,
        @InjectRepository(ExamSemester)
        private readonly examSemesterRepository: Repository<ExamSemester>,

        private readonly examStructureConfigService: ExamStructureConfigService,
        private readonly moduleTypeService: ModuleTypeService,
    ) {}

    async save(createExamStructure: CreateExamStructureDto): Promise<CreateExamStructureDto> {
        const {
            examScoreId,
            examStructureType,
            structurename,
            description,
            requiredCorrectInModule1RW,
            requiredCorrectInModule1M,
            examStructureConfig,
            moduleType,
            examSemesterId,
        } = createExamStructure;

        const examstructureTypeEntity = await this.examStructureTypeRepository.findOne({
            where: { name: examStructureType },
        });

        const examSemester = await this.examSemesterRepository.findOne({
            where: { id: examSemesterId },
        });

        if (!examstructureTypeEntity) {
            throw new NotFoundException('ExamStructureType is not found');
        }

        if (!examSemester) {
            throw new NotFoundException('ExamSemester is not found');
        }

        const examScore = await this.examScoreRepository.findOne({
            where: { id: examScoreId },
        });

        const newExamStructure = this.repository.create({
            examScore: examScore,
            examStructureType: examstructureTypeEntity,
            structurename,
            description,
            requiredCorrectInModule1RW,
            requiredCorrectInModule1M,
            examSemester: examSemester,
        });

        const savedExamstructure = await this.repository.save(newExamStructure);

        await this.examStructureConfigService.save(
            savedExamstructure.id,
            Array.isArray(examStructureConfig) ? examStructureConfig : [examStructureConfig],
        );

        await this.moduleTypeService.save(
            savedExamstructure.id,
            Array.isArray(moduleType) ? moduleType : [moduleType],
        );

        return plainToInstance(CreateExamStructureDto, savedExamstructure, {
            excludeExtraneousValues: true,
        });
    }

    async get(page: number, pageSize: number): Promise<any> {
        const [result, total] = await this.repository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
            order: { createdat: 'DESC' },
            relations: [
                'examScore',
                'examStructureType',
                'examSemester',
                'configs',
                'moduletype',
                'moduletype.section',
                'moduletype.domaindistribution',
                'moduletype.domaindistribution.domain',
                'moduletype.domaindistribution.domain.section',
            ],
        });

        // Ánh xạ kết quả để lấy section.name của mỗi ModuleType
        const formattedResult = result.map((examStructure) => ({
            id: examStructure.id,
            structurename: examStructure.structurename,
            description: examStructure.description,
            requiredCorrectInModule1RW: examStructure.requiredCorrectInModule1RW,
            requiredCorrectInModule1M: examStructure.requiredCorrectInModule1M,
            createdat: examStructure.createdat,
            examScore: examStructure.examScore,
            examStructureType: examStructure.examStructureType,
            examSemester: examStructure.examSemester,
            configs: examStructure.configs,
            moduletype: examStructure.moduletype.map((moduleType) => ({
                id: moduleType.id,
                name: moduleType.name,
                level: moduleType.level,
                numberOfQuestion: moduleType.numberofquestion,
                section: moduleType.section ? moduleType.section.name : null,
                domaindistribution: moduleType.domaindistribution.map((distribution) => ({
                    id: distribution.id,
                    numberofquestion: distribution.numberofquestion,
                    domain: distribution.domain.content,
                    section: distribution.domain.section.name,
                })),
            })),
        }));

        return {
            result: formattedResult,
            total,
        };
    }
}
