import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExamSemester } from 'src/database/entities/examsemeseter.entity';
import { Repository } from 'typeorm';
import { ExamSemesterWithDetailsDto } from './dto/exam-semester.dto';
import { DomainDistributionConfig } from 'src/database/entities/domaindistributionconfig.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
    UpdateDomainDistributionConfigDto,
    UpdateExamSemesterDto,
} from './dto/update-examsemester.dto';
import {
    UploadFileDomainDistributionConfigDto,
    UploadFileExamSemesterDto,
} from './dto/uploadfile-examsemester.dto';
import { CreateExamSemeseterDto } from './dto/create-examsemester.dto';
import { DomainDistributionConfigService } from '../domain-distribution-config/domain-distribution-config.service';

@Injectable()
export class ExamSemesterService {
    constructor(
        @InjectRepository(ExamSemester)
        private readonly examSemesterRepository: Repository<ExamSemester>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        @InjectRepository(DomainDistributionConfig)
        private readonly domainDistributionConfigRepository: Repository<DomainDistributionConfig>,

        private readonly domainDistributionConfigService: DomainDistributionConfigService,
    ) {}

    async getExamSemestersWithDetails(): Promise<ExamSemesterWithDetailsDto[]> {
        const examSemesters = await this.examSemesterRepository.find({
            relations: [
                // 'examStructures',
                // 'examStructures.examStructureType',
                'domainDistributionConfigs',
                'domainDistributionConfigs.domain',
                'domainDistributionConfigs.domain.section',
            ],
        });

        return examSemesters.map((semester) => ({
            id: semester.id,
            title: semester.title,
            datefrom: semester.datefrom,
            dateto: semester.dateto,
            // examStructure: semester.examStructures.map((structure) => ({
            //     id: structure.id,
            //     name: structure.structurename,
            //     structureType: structure.examStructureType?.name,
            // })),
            domainDistributionConfig: semester.domainDistributionConfigs.map((config) => ({
                domain: config.domain?.content,
                percentage: config.percent,
                minQuestion: config.minQuestion,
                maxQuestion: config.maxQuestion,
                section: config.domain?.section
                    ? {
                          // Check if section exists
                          id: config.domain.section.id,
                          name: config.domain.section.name,
                      }
                    : null,
            })),
        }));
    }

    async getExamSemesterById(id: string): Promise<ExamSemesterWithDetailsDto> {
        const semester = await this.examSemesterRepository.findOne({
            where: { id },
            relations: [
                // 'examStructures',
                // 'examStructures.examStructureType',
                'domainDistributionConfigs',
                'domainDistributionConfigs.domain',
                'domainDistributionConfigs.domain.section',
            ],
        });

        if (!semester) {
            throw new NotFoundException(`ExamSemester with ID ${id} not found`);
        }

        return {
            id: semester.id,
            title: semester.title,
            datefrom: semester.datefrom,
            dateto: semester.dateto,
            // examStructure: semester.examStructures.map((structure) => ({
            //     id: structure.id,
            //     name: structure.structurename,
            //     structureType: structure.examStructureType?.name,
            // })),
            domainDistributionConfig: semester.domainDistributionConfigs.map((config) => ({
                domain: config.domain?.content,
                percentage: config.percent,
                minQuestion: config.minQuestion,
                maxQuestion: config.maxQuestion,
                section: config.domain?.section
                    ? {
                          // Check if section exists
                          id: config.domain.section.id,
                          name: config.domain.section.name,
                      }
                    : null,
            })),
        };
    }

    async uploadExamSemesterWithConfigs(
        createDomainDistributionConfigDtoArray: UploadFileDomainDistributionConfigDto[],
        createExamSemester: UploadFileExamSemesterDto,
    ): Promise<{
        savedConfigs: DomainDistributionConfig[];
        errors: { config: UploadFileDomainDistributionConfigDto; message: string }[];
    }> {
        const savedConfigs: DomainDistributionConfig[] = [];
        const errors: {
            config: UploadFileDomainDistributionConfigDto;
            message: string;
        }[] = [];

        const { title, dateFrom, dateTo } = createExamSemester;

        const examSemester = this.examSemesterRepository.create({
            title: title,
            datefrom: dateFrom,
            dateto: dateTo,
        });

        const savedExamSemester = await this.examSemesterRepository.save(examSemester);

        for (const createDomainDistributionConfigDto of createDomainDistributionConfigDtoArray) {
            try {
                const { title, minQuestion, maxQuestion, percent, domain } =
                    createDomainDistributionConfigDto;

                // Find Domain by name
                const foundDomain = await this.domainRepository.findOne({
                    where: { content: domain },
                });

                if (!foundDomain) {
                    throw new NotFoundException(`Domain not found: ${domain}`);
                }

                // Validate the DTO fields
                const configInstance = plainToInstance(
                    UploadFileDomainDistributionConfigDto,
                    createDomainDistributionConfigDto,
                );
                const validationErrors = await validate(configInstance);

                if (validationErrors.length > 0) {
                    const validationMessages = validationErrors
                        .map((err) => Object.values(err.constraints).join(', '))
                        .join('; ');
                    throw new Error(validationMessages);
                }

                // Check for existing config with same title in the same ExamSemester and Domain
                const existingConfig = await this.domainDistributionConfigRepository.findOne({
                    where: {
                        title,
                        examSemester: { id: savedExamSemester.id },
                        domain: { id: foundDomain.id },
                    },
                });

                if (existingConfig) {
                    throw new HttpException(
                        `Config with title "${title}" already exists for the given ExamSemester and Domain`,
                        HttpStatus.BAD_REQUEST,
                    );
                }

                // Create new DomainDistributionConfig
                const newConfig = this.domainDistributionConfigRepository.create({
                    title,
                    minQuestion,
                    maxQuestion,
                    percent,
                    domain: foundDomain,
                    examSemester: examSemester,
                });

                // Save the new config
                const savedConfig = await this.domainDistributionConfigRepository.save(newConfig);
                savedConfigs.push(savedConfig);
            } catch (error) {
                errors.push({
                    config: createDomainDistributionConfigDto,
                    message: error.message || 'Unknown error',
                });
            }
        }

        return {
            savedConfigs,
            errors,
        };
    }

    async saveExamSemesterWithConfigs(
        createExamSemesterDto: UploadFileExamSemesterDto,
        createDomainDistributionConfigDtoArray: UploadFileDomainDistributionConfigDto[],
    ): Promise<ExamSemester> {
        const { title, dateFrom, dateTo } = createExamSemesterDto;

        const newExamSemester = this.examSemesterRepository.create({
            title,
            datefrom: dateFrom,
            dateto: dateTo,
        });

        const savedExamSemester = await this.examSemesterRepository.save(newExamSemester);

        for (const configDto of createDomainDistributionConfigDtoArray) {
            const { title, minQuestion, maxQuestion, percent, domain } = configDto;

            const foundDomain = await this.domainRepository.findOne({
                where: { content: domain },
            });
            if (!foundDomain) {
                throw new NotFoundException(`Domain not found: ${domain}`);
            }

            const configInstance = plainToInstance(
                UploadFileDomainDistributionConfigDto,
                configDto,
            );
            const validationErrors = await validate(configInstance);
            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }

            const existingConfig = await this.domainDistributionConfigRepository.findOne({
                where: {
                    title,
                    examSemester: { id: savedExamSemester.id },
                    domain: { id: foundDomain.id },
                },
            });

            if (existingConfig) {
                throw new HttpException(
                    `Config with title "${title}" already exists for the given ExamSemester and Domain`,
                    HttpStatus.BAD_REQUEST,
                );
            }

            const newConfig = this.domainDistributionConfigRepository.create({
                title,
                minQuestion,
                maxQuestion,
                percent,
                domain: foundDomain,
                examSemester: savedExamSemester,
            });

            await this.domainDistributionConfigRepository.save(newConfig);
        }

        return savedExamSemester;
    }

    async updateExamSemesterWithConfigs(
        id: string,
        updateExamSemesterDto: UpdateExamSemesterDto,
        updateDomainDistributionConfigDtoArray: UpdateDomainDistributionConfigDto[],
    ): Promise<ExamSemester> {
        const examSemester = await this.examSemesterRepository.findOne({
            where: { id },
            relations: ['domainDistributionConfigs'],
        });

        if (!examSemester) {
            throw new NotFoundException('ExamSemester not found');
        }

        Object.assign(examSemester, updateExamSemesterDto);
        const savedExamSemester = await this.examSemesterRepository.save(examSemester);

        for (const configDto of updateDomainDistributionConfigDtoArray) {
            const { id: configId, title, minQuestion, maxQuestion, percent, domain } = configDto;

            const foundDomain = await this.domainRepository.findOne({
                where: { content: domain },
            });
            if (!foundDomain) {
                throw new NotFoundException(`Domain not found: ${domain}`);
            }

            const configInstance = plainToInstance(UpdateDomainDistributionConfigDto, configDto);
            const validationErrors = await validate(configInstance);
            if (validationErrors.length > 0) {
                const validationMessages = validationErrors
                    .map((err) => Object.values(err.constraints).join(', '))
                    .join('; ');
                throw new Error(validationMessages);
            }

            let domainConfig = await this.domainDistributionConfigRepository.findOne({
                where: { id: configId, examSemester: { id: savedExamSemester.id } },
            });

            if (!domainConfig) {
                domainConfig = this.domainDistributionConfigRepository.create({
                    title,
                    minQuestion,
                    maxQuestion,
                    percent,
                    domain: foundDomain,
                    examSemester: savedExamSemester,
                });
            } else {
                Object.assign(domainConfig, configDto, { domain: foundDomain });
            }

            await this.domainDistributionConfigRepository.save(domainConfig);
        }

        return this.examSemesterRepository.findOne({
            where: { id: savedExamSemester.id },
            relations: ['domainDistributionConfigs'],
        });
    }

    async createExamSemesterWithConfigs(
        createExamSemesterDto: CreateExamSemeseterDto,
    ): Promise<CreateExamSemeseterDto> {
        const saveExamSemester = await this.examSemesterRepository.create({
            title: createExamSemesterDto.title,
            datefrom: createExamSemesterDto.dateFrom,
            dateto: createExamSemesterDto.dateTo,
        });

        await this.examSemesterRepository.save(saveExamSemester);

        await this.domainDistributionConfigService.createMany(
            createExamSemesterDto.createDomainDistributionConfig,
            saveExamSemester.id,
        );

        return createExamSemesterDto;
    }
}
