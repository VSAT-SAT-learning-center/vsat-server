import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
import { title } from 'process';

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
        const [examStructure, examType, modules, domains, questions] = await Promise.all([
            this.examStructureRepository.findOne({
                where: { id: createExamDto.examStructureId },
            }),
            this.examTypeRepository.findOne({ where: { id: createExamDto.examTypeId } }),
            this.moduleTypeRepository.findByIds(
                createExamDto.examQuestions.map((q) => q.moduleId),
            ),
            this.domainRepository.findBy({
                content: In(
                    createExamDto.examQuestions.flatMap((q) =>
                        q.domains.map((d) => d.domain),
                    ),
                ),
            }),
            this.questionRepository.findByIds(
                createExamDto.examQuestions.flatMap((q) =>
                    q.domains.flatMap((d) => d.questions.map((q) => q.id)),
                ),
            ),
        ]);

        if (!examStructure) {
            throw new HttpException(`ExamStructure was not found`, HttpStatus.NOT_FOUND);
        }

        if (!examType) {
            throw new HttpException(`ExamType was not found`, HttpStatus.NOT_FOUND);
        }

        const moduleMap = new Map(modules.map((module) => [module.id, module]));
        const domainMap = new Map(domains.map((domain) => [domain.content, domain]));
        const questionMap = new Map(questions.map((question) => [question.id, question]));

        for (const examQuestion of createExamDto.examQuestions) {
            if (!moduleMap.has(examQuestion.moduleId)) {
                throw new HttpException(`ModuleType not found`, HttpStatus.NOT_FOUND);
            }

            for (const domain of examQuestion.domains) {
                if (!domainMap.has(domain.domain)) {
                    throw new HttpException(
                        `Domain with content ${domain.domain} not found`,
                        HttpStatus.NOT_FOUND,
                    );
                }

                for (const question of domain.questions) {
                    if (!questionMap.has(question.id)) {
                        throw new HttpException(
                            `Question with ID ${question.id} not found`,
                            HttpStatus.NOT_FOUND,
                        );
                    }
                }
            }
        }

        for (const config of createExamDto.moduleConfig) {
            if (!moduleMap.has(config.moduleId)) {
                throw new HttpException('ModuleType is not found', HttpStatus.NOT_FOUND);
            }

            if (config.time <= 0) {
                throw new HttpException('Invalid time value', HttpStatus.BAD_REQUEST);
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

    async GetExamWithExamQuestion() {
        const findExamsWithQuestions = async () => {
            return await this.examRepository.find({
                relations: ['examquestion', 'examStructure', 'examType'],
            });
        };

        const findModuleQuestionsByExamId = async (examId: string) => {
            const modules = await this.moduleTypeRepository
                .createQueryBuilder('moduleType')
                .innerJoinAndSelect('moduleType.examquestion', 'examQuestion')
                .innerJoinAndSelect('examQuestion.question', 'question')
                .leftJoinAndSelect('question.level', 'level')
                .leftJoinAndSelect('question.skill', 'skill')
                .leftJoinAndSelect('skill.domain', 'domain')
                .leftJoinAndSelect('question.section', 'section')
                .leftJoinAndSelect('question.answers', 'answers')
                .leftJoinAndSelect('moduleType.section', 'moduleSection')
                .where('examQuestion.exam.id = :examId', { examId })
                .getMany();

            let totalNumberOfQuestions = 0;
            let totalTime = 0;

            const moduleDetails = modules.map((module) => {
                // Kiểm tra điều kiện và cộng dồn nếu thoả mãn
                if (
                    (module.section?.name === 'Reading & Writing' ||
                        module.section?.name === 'Math') &&
                    (module.name === 'Module 1' || module.name === 'Module 2') &&
                    (module.level === null || module.level === 'Easy')
                ) {
                    totalNumberOfQuestions += module.numberofquestion || 0;
                    totalTime += module.time || 0;
                }

                // Tổ chức các domains
                const domains = new Map();
                module.examquestion.forEach((examQuestion) => {
                    const domainName = examQuestion.question.skill?.domain?.content;
                    if (!domainName) return;

                    if (!domains.has(domainName)) {
                        domains.set(domainName, {
                            domain: domainName,
                            questions: [],
                        });
                    }

                    domains.get(domainName).questions.push({
                        id: examQuestion.question.id,
                        content: examQuestion.question.content,
                        plainContent: examQuestion.question.plainContent,
                        explain: examQuestion.question.explain,
                        sort: examQuestion.question.sort,
                        isSingleChoiceQuestion:
                            examQuestion.question.isSingleChoiceQuestion,
                        status: examQuestion.question.status,
                        countfeedback: examQuestion.question.countfeedback,
                        isActive: examQuestion.question.isActive,
                        level: examQuestion.question.level
                            ? examQuestion.question.level.name
                            : null,
                        skill: examQuestion.question.skill
                            ? examQuestion.question.skill.content
                            : null,
                        section: examQuestion.question.section
                            ? examQuestion.question.section.name
                            : null,
                        answers: examQuestion.question.answers.map((answer) => ({
                            id: answer.id,
                            text: answer.text,
                            isCorrect: answer.isCorrectAnswer,
                        })),
                    });
                });

                return {
                    id: module.id,
                    name: module.name,
                    level: module.level,
                    numberofquestion: module.numberofquestion,
                    time: module.time,
                    section: module.section?.name || null,
                    domains: Array.from(domains.values()),
                };
            });

            return { totalNumberOfQuestions, totalTime, modules: moduleDetails };
        };

        const exams = await findExamsWithQuestions();

        return await Promise.all(
            exams.map(async (exam) => {
                const { totalNumberOfQuestions, totalTime, modules } =
                    await findModuleQuestionsByExamId(exam.id);

                return {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    totalNumberOfQuestions,
                    totalTime,
                    examQuestions: modules,
                    examStructure: exam.examStructure
                        ? {
                              id: exam.examStructure.id,
                              structurename: exam.examStructure.structurename,
                              description: exam.examStructure.description,
                              requiredCorrectInModule1RW:
                                  exam.examStructure.requiredCorrectInModule1RW,
                              requiredCorrectInModule1M:
                                  exam.examStructure.requiredCorrectInModule1M,
                          }
                        : null,
                    examType: exam.examType
                        ? { id: exam.examType.id, name: exam.examType.name }
                        : null,
                };
            }),
        );
    }
}
