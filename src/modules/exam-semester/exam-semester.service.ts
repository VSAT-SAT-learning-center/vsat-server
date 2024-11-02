import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';
import { Repository } from 'typeorm';
import { ExamSemesterWithDetailsDto } from './dto/exam-semester.dto';

@Injectable()
export class ExamSemesterService {
    constructor(
        @InjectRepository(ExamSemester)
        private readonly examSemesterRepository: Repository<ExamSemester>,
    ) {}

    async getExamSemestersWithDetails(): Promise<ExamSemesterWithDetailsDto[]> {
        const examSemesters = await this.examSemesterRepository.find({
            relations: [
                'examStructures',
                'examStructures.examStructureType',
                'domainDistributionConfigs',
                'domainDistributionConfigs.domain',
            ],
        });

        return examSemesters.map((semester) => ({
            id: semester.id,
            title: semester.title,
            time: semester.time,
            // examStructure: semester.examStructures.map((structure) => ({
            //     id: structure.id,
            //     name: structure.structurename,
            //     structureType: structure.examStructureType?.name,
            // })),
            domainDistributionConfig: semester.domainDistributionConfigs.map(
                (config) => ({
                    domain: config.domain?.content,
                    percentage: config.percent,
                    minQuestion: config.minQuestion,
                    maxQuestion: config.maxQuestion,
                }),
            ),
        }));
    }

    async getExamSemesterById(id: string): Promise<ExamSemesterWithDetailsDto> {
        const semester = await this.examSemesterRepository.findOne({
            where: { id },
            relations: [
                'examStructures',
                'examStructures.examStructureType',
                'domainDistributionConfigs',
                'domainDistributionConfigs.domain',
            ],
        });

        if (!semester) {
            throw new NotFoundException(`ExamSemester with ID ${id} not found`);
        }

        return {
            id: semester.id,
            title: semester.title,
            time: semester.time,
            // examStructure: semester.examStructures.map((structure) => ({
            //     id: structure.id,
            //     name: structure.structurename,
            //     structureType: structure.examStructureType?.name,
            // })),
            domainDistributionConfig: semester.domainDistributionConfigs.map(
                (config) => ({
                    domain: config.domain?.content,
                    percentage: config.percent,
                    minQuestion: config.minQuestion,
                    maxQuestion: config.maxQuestion,
                }),
            ),
        };
    }
}
