import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { Exam } from 'src/database/entities/exam.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamType } from 'src/database/entities/examtype.entity';
import { ExamQuestionService } from '../examquestion/examquestion.service';
import { ModuleTypeService } from '../module-type/module-type.service';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { Question } from 'src/database/entities/question.entity';
import { Domain } from 'src/database/entities/domain.entity';

@Injectable()
export class ExamService {
    constructor(
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        @InjectRepository(ExamType)
        private readonly examTypeRepository: Repository<ExamType>,
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,

        private readonly examQuestionservice: ExamQuestionService,
        private readonly moduleTypeService: ModuleTypeService,
    ) {}

    async createExam(createExamDto: CreateExamDto): Promise<Exam> {
        const examStructure = await this.examStructureRepository.findOne({
            where: { id: createExamDto.examStructureId },
        });

        if (!examStructure) {
            throw new HttpException(
                `ExamStructure with ID ${createExamDto.examStructureId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        const examType = await this.examTypeRepository.findOne({
            where: { id: createExamDto.examTypeId },
        });

        if (!examType) {
            throw new HttpException(
                `ExamType with ID ${createExamDto.examTypeId} not found`,
                HttpStatus.NOT_FOUND,
            );
        }

        for (const examQuestion of createExamDto.examQuestions) {
            const moduleType = await this.moduleTypeRepository.findOne({
                where: { id: examQuestion.moduleId },
            });

            if (!moduleType) {
                throw new HttpException(
                    `ModuleType with ID ${examQuestion.moduleId} not found`,
                    HttpStatus.NOT_FOUND,
                );
            }

            for (const domain of examQuestion.domains) {
                const domainEntity = await this.domainRepository.findOne({
                    where: { content: domain.domain },
                });

                if (!domainEntity) {
                    throw new HttpException(
                        `Domain with content ${domain.domain} not found`,
                        HttpStatus.NOT_FOUND,
                    );
                }

                for (const question of domain.questions) {
                    const questionEntity = await this.questionRepository.findOne({
                        where: { id: question.id },
                    });

                    if (!questionEntity) {
                        throw new HttpException(
                            `Question with ID ${question.id} not found`,
                            HttpStatus.NOT_FOUND,
                        );
                    }
                }
            }
        }

        for (const config of createExamDto.moduleConfig) {
            const module = await this.moduleTypeRepository.findOne({
                where: { id: config.moduleId },
            });

            if (!module) {
                throw new HttpException(`ModuleType is not found`, HttpStatus.NOT_FOUND);
            }

            if (config.time <= 0) {
                throw new HttpException(`Invalid time value`, HttpStatus.BAD_REQUEST);
            }
        }

        const newExam = this.examRepository.create({
            title: createExamDto.title,
            description: createExamDto.description,
            examStructure: examStructure,
            examType: examType,
        });

        const savedExam = await this.examRepository.save(newExam);

        await this.examQuestionservice.createExamQuestion(
            savedExam.id,
            createExamDto.examQuestions,
        );

        await this.moduleTypeService.saveModuleConfig(createExamDto.moduleConfig);

        return savedExam;
    }
}
