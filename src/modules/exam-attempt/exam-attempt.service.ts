import sanitizeHtml from 'sanitize-html';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { BaseService } from '../base/base.service';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { CreateTargetLearningDto } from '../target-learning/dto/create-targetlearning.dto';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { Unit } from 'src/database/entities/unit.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';
import { Exam } from 'src/database/entities/exam.entity';
import { Account } from 'src/database/entities/account.entity';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { ExamAttemptDetailService } from '../exam-attempt-detail/exam-attempt-detail.service';
import { ExamScoreDetail } from 'src/database/entities/examscoredetail.entity';
import { ExamStructure } from 'src/database/entities/examstructure.entity';
import { ExamScore } from 'src/database/entities/examscore.entity';
import { plainToInstance } from 'class-transformer';
import { ExamService } from '../exam/exam.service';
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { title } from 'process';
import { StudyProfileService } from '../study-profile/study-profile.service';

@Injectable()
export class ExamAttemptService extends BaseService<ExamAttempt> {
    constructor(
        @InjectRepository(ExamAttempt)
        private readonly examAttemptRepository: Repository<ExamAttempt>,
        @InjectRepository(Level)
        private readonly levelRepository: Repository<Level>,
        @InjectRepository(Section)
        private readonly sectionRepository: Repository<Section>,
        @InjectRepository(Unit)
        private readonly unitRepository: Repository<Unit>,
        @InjectRepository(Domain)
        private readonly domainRepository: Repository<Domain>,
        @InjectRepository(ExamAttemptDetail)
        private readonly examAttemptDetailRepository: Repository<ExamAttemptDetail>,
        @InjectRepository(Exam)
        private readonly examRepository: Repository<Exam>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        @InjectRepository(ExamScoreDetail)
        private readonly examScoreDetailRepository: Repository<ExamScoreDetail>,
        @InjectRepository(ExamStructure)
        private readonly examStructureRepository: Repository<ExamStructure>,
        @InjectRepository(ExamScore)
        private readonly examScoreRepository: Repository<ExamScore>,
        @InjectRepository(DomainDistribution)
        private readonly domainDistributionRepository: Repository<DomainDistribution>,
        @InjectRepository(ModuleType)
        private readonly moduleTypeRepository: Repository<ModuleType>,

        private readonly targetLearningService: TargetLearningService,
        private readonly unitProgressService: UnitProgressService,
        private readonly examAttemptDetailService: ExamAttemptDetailService,
        private readonly studyProfileService: StudyProfileService,
    ) {
        super(examAttemptRepository);
    }

    async recommend(
        examAttemptId: string,
        createTargetLearningDto: CreateTargetLearningDto,
        accountId: string,
    ) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: accountId } },
            order: { createdat: 'ASC' },
        });
    
        if (!studyProfile) {
            throw new NotFoundException('StudyProfile is not found');
        }
    
        await this.studyProfileService.saveTarget(
            createTargetLearningDto.targetLearningRW,
            createTargetLearningDto.targetLearningMath,
            accountId,
        );
    
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['studyProfile'],
        });
    
        const [foundation, medium, advance] = await Promise.all([
            this.levelRepository.findOne({ where: { name: 'Foundation' } }),
            this.levelRepository.findOne({ where: { name: 'Medium' } }),
            this.levelRepository.findOne({ where: { name: 'Advance' } }),
        ]);
    
        const [math, RW] = await Promise.all([
            this.sectionRepository.findOne({ where: { name: 'Math' } }),
            this.sectionRepository.findOne({ where: { name: 'Reading & Writing' } }),
        ]);
    
        const recommendedUnits: { Math: any[]; RW: any[] } = { Math: [], RW: [] };
    
        // Handle Math section
        if (examAttempt.scoreMath < 400) {
            createTargetLearningDto.levelId = foundation.id;
            createTargetLearningDto.sectionId = math.id;
    
            const targetLearning = await this.targetLearningService.save(
                createTargetLearningDto,
                studyProfile.id,
            );
    
            const units = await this.unitProgressService.startMultipleUnitProgress(
                targetLearning.id,
                await this.unitRepository
                    .find({ where: { section: math, level: foundation }, select: ['id', 'title'] })
                    .then((units) => units.map((u) => u.id)),
            );
    
            recommendedUnits.Math.push(...units);
        } else if (
            examAttempt.studyProfile.targetscoreMath >= 400 &&
            examAttempt.studyProfile.targetscoreMath < 600 &&
            examAttempt.scoreMath < 600
        ) {
            createTargetLearningDto.levelId = medium.id;
            createTargetLearningDto.sectionId = math.id;
    
            const targetLearning = await this.targetLearningService.save(
                createTargetLearningDto,
                studyProfile.id,
            );
    
            const units = await this.unitProgressService.startMultipleUnitProgress(
                targetLearning.id,
                await this.unitRepository
                    .find({ where: { section: math, level: medium }, select: ['id', 'title'] })
                    .then((units) => units.map((u) => u.id)),
            );
    
            recommendedUnits.Math.push(...units);
        }
    
        // Handle RW section
        if (examAttempt.scoreRW < 400) {
            createTargetLearningDto.levelId = foundation.id;
            createTargetLearningDto.sectionId = RW.id;
    
            const targetLearning = await this.targetLearningService.save(
                createTargetLearningDto,
                studyProfile.id,
            );
    
            const units = await this.unitProgressService.startMultipleUnitProgress(
                targetLearning.id,
                await this.unitRepository
                    .find({ where: { section: RW, level: foundation }, select: ['id', 'title'] })
                    .then((units) => units.map((u) => u.id)),
            );
    
            recommendedUnits.RW.push(...units);
        } else if (
            examAttempt.studyProfile.targetscoreRW >= 400 &&
            examAttempt.studyProfile.targetscoreRW < 600 &&
            examAttempt.scoreRW < 600
        ) {
            createTargetLearningDto.levelId = medium.id;
            createTargetLearningDto.sectionId = RW.id;
    
            const targetLearning = await this.targetLearningService.save(
                createTargetLearningDto,
                studyProfile.id,
            );
    
            const units = await this.unitProgressService.startMultipleUnitProgress(
                targetLearning.id,
                await this.unitRepository
                    .find({ where: { section: RW, level: medium }, select: ['id', 'title'] })
                    .then((units) => units.map((u) => u.id)),
            );
    
            recommendedUnits.RW.push(...units);
        }
    
        return recommendedUnits;
    }
    

    async findOneById(examAttemptId: string): Promise<ExamAttempt> {
        return this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['exam', 'exam.examStructure'],
        });
    }

    async updateScore(
        examAttemptId: string,
        scoreRW: number,
        scoreMath: number,
    ): Promise<void> {
        await this.examAttemptRepository.update(examAttemptId, {
            scoreRW,
            scoreMath,
        });
    }
    //RW
    async getExamAtemptDomainRW(examAttemptId: string, iscorrect: boolean) {
        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const domainCounts = [];

        for (const domain of domainsRW) {
            let totalSkill = 0;
            let total = 0;
            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkill += allSkills;

                const skillCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                total += skillCount;
            }

            const percent = (total * 100) / totalSkill;

            domainCounts.push({
                doaminId: domain.id,
                domainContent: domain.content,
                count: total,
                percent: percent,
            });
        }

        return domainCounts;
    }

    async getExamAtemptsSkillRW(examAttemptId: string, iscorrect: boolean) {
        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const skillCounts = [];
        const skillAllCounts = [];

        for (const domain of domainsRW) {
            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                skillAllCounts.push({
                    skillId: skill.id,
                    skillContent: skill.content,
                    count: allSkills,
                });

                const skillFind = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                skillCounts.push({
                    skillId: skill.id,
                    skillContent: skill.content,
                    count: skillFind,
                    percent: (skillFind * 100) / allSkills || 0,
                });
            }
        }
        return skillCounts;
    }

    //Math
    async getExamAtemptDomainMath(examAttemptId: string, iscorrect: boolean) {
        const domainsMath = await this.domainRepository.find({
            where: { section: { name: 'Math' } },
            relations: ['skills'],
        });

        const domainCounts = [];

        for (const domain of domainsMath) {
            let totalSkill = 0;
            let total = 0;

            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkill += allSkills;

                const skillCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                total += skillCount;
            }

            const percent = (total * 100) / totalSkill || 0;

            domainCounts.push({
                doaminId: domain.id,
                domainContent: domain.content,
                count: total,
                percent: percent,
            });
        }

        return domainCounts;
    }

    async getExamAtemptsSkillMath(examAttemptId: string, iscorrect: boolean) {
        const domainsMath = await this.domainRepository.find({
            where: { section: { name: 'Math' } },
            relations: ['skills'],
        });

        const skillCounts = [];
        const skillAllCounts = [];
        for (const domain of domainsMath) {
            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                skillAllCounts.push({
                    skillId: skill.id,
                    skillContent: skill.content,
                    count: allSkills,
                });

                const skillFind = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                skillCounts.push({
                    skillId: skill.id,
                    skillContent: skill.content,
                    count: skillFind,
                    percent: (skillFind * 100) / allSkills || 0,
                });
            }
        }
        return skillCounts;
    }

    async createExamAttempt(
        createExamAttemptDto: CreateExamAttemptDto,
        accountId: string,
    ): Promise<CreateExamAttemptDto> {
        const exam = await this.examRepository.findOne({
            where: { id: createExamAttemptDto.examId },
            relations: [
                'examStructure',
                'examStructure.examScore',
                'examStructure.examScore.examScoreDetails',
            ],
        });

        const account = await this.accountRepository.findOne({
            where: { id: accountId },
        });

        let scoreRW;
        let scoreMath;

        if (createExamAttemptDto.isHardRW) {
            const examScoreDetailRW = await this.examScoreDetailRepository.findOne({
                where: {
                    rawscore: createExamAttemptDto.correctAnswerRW,
                    section: { name: 'Reading & Writing' },
                    examScore: { id: exam.examStructure.examScore.id },
                },
            });

            scoreRW = examScoreDetailRW.upperscore;
        }
        if (!createExamAttemptDto.isHardRW) {
            const examScoreDetailRW = await this.examScoreDetailRepository.findOne({
                where: {
                    rawscore: createExamAttemptDto.correctAnswerRW,
                    section: { name: 'Reading & Writing' },
                    examScore: { id: exam.examStructure.examScore.id },
                },
            });
            scoreRW = examScoreDetailRW.lowerscore;
        }
        if (createExamAttemptDto.isHardMath) {
            const examScoreDetailMath = await this.examScoreDetailRepository.findOne({
                where: {
                    rawscore: createExamAttemptDto.correctAnswerMath,
                    section: { name: 'Math' },
                    examScore: { id: exam.examStructure.examScore.id },
                },
            });

            scoreMath = examScoreDetailMath.upperscore;
        }
        if (!createExamAttemptDto.isHardMath) {
            const examScoreDetailMath = await this.examScoreDetailRepository.findOne({
                where: {
                    rawscore: createExamAttemptDto.correctAnswerMath,
                    section: { name: 'Math' },
                    examScore: { id: exam.examStructure.examScore.id },
                },
            });

            scoreMath = examScoreDetailMath.lowerscore;
        }

        if (!exam) {
            throw new NotFoundException('Exam is not found');
        }

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        const studyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: account.id } },
        });

        const createExamAttempt = await this.examAttemptRepository.create({
            studyProfile: studyProfile,
            exam: exam,
            attemptdatetime: new Date(),
            scoreMath: scoreMath,
            scoreRW: scoreRW,
        });

        const savedExamAttempt = await this.examAttemptRepository.save(createExamAttempt);

        await this.examAttemptDetailService.check(
            createExamAttemptDto.createExamAttemptDetail,
            savedExamAttempt.id,
        );

        return plainToInstance(CreateExamAttemptDto, {
            scoreMath: savedExamAttempt.scoreMath,
            scoreRW: savedExamAttempt.scoreRW,
            attemptId: savedExamAttempt.id,
        });
    }

    async getExamAttemptByStudyProfileId(accountId: string) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: accountId } },
        });

        const examAttempt = await this.examAttemptRepository.find({
            where: { studyProfile: { id: studyProfile.id } },
            relations: [
                'exam',
                'studyProfile',
                'exam.examquestion',
                'exam.examquestion.question',
            ],
        });

        if (!examAttempt) {
            throw new NotFoundException('ExamAttempt is not found');
        }

        const detailedExamAttempts = await Promise.all(
            examAttempt.map(async (attempt) => {
                const examDetails = await this.GetExamWithExamQuestionByExamId(
                    attempt.exam.id,
                );

                return {
                    ...attempt,
                    exam: examDetails,
                };
            }),
        );

        return detailedExamAttempts;
    }

    async GetExamWithExamQuestionByExamId(examId: string) {
        const exam = await this.examRepository
            .createQueryBuilder('exam')
            .select(['exam.id', 'exam.title'])
            .where('exam.id = :examId', { examId })
            .getOne();

        if (!exam) {
            throw new NotFoundException(`Exam with ID ${examId} not found`);
        }

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
            .orderBy('moduleType.updatedat', 'DESC')
            .getMany();

        let totalNumberOfQuestions = 0;
        let totalTime = 0;

        const moduleDetails = [];
        for (const module of modules) {
            if (
                (module.section?.name === 'Reading & Writing' ||
                    module.section?.name === 'Math') &&
                (module.name === 'Module 1' || module.name === 'Module 2') &&
                (module.level === null || module.level === 'Easy')
            ) {
                totalNumberOfQuestions += module.numberofquestion || 0;
                totalTime += module.time || 0;
            }
        }

        return {
            id: exam.id,
            examTitle: exam.title,
            totalNumberOfQuestions,
            totalTime,
            modules: moduleDetails,
        };
    }

    async getExamAttemptStatistics(examAttemptId: string) {
        // Truy vấn để lấy thông tin ExamAttempt trước
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['exam'],
        });

        if (!examAttempt || !examAttempt.exam) {
            throw new Error(
                `ExamAttempt or associated Exam not found for id "${examAttemptId}".`,
            );
        }

        const examId = examAttempt.exam.id;

        const sections = ['Reading & Writing', 'Math'];
        const sectionMap = {
            'Reading & Writing': 'RW',
            Math: 'M',
        };
        const statistics = {};

        for (const sectionName of sections) {
            const sectionKey = sectionMap[sectionName];

            const section = await this.sectionRepository.findOne({
                where: { name: sectionName },
            });

            if (!section) {
                throw new Error(`Section with name "${sectionName}" not found.`);
            }

            const sectionId = section.id;

            const domains = await this.domainRepository.find({
                where: { section: { id: sectionId } },
                relations: ['skills'],
            });

            // Domain
            const domainCounts = [];
            for (const domain of domains) {
                let totalSkill = 0;
                let totalCorrect = 0;
                let totalIncorrect = 0;

                for (const skill of domain.skills) {
                    const totalSkillCount = await this.examAttemptDetailRepository.count({
                        where: {
                            examAttempt: { id: examAttemptId },
                            question: { skill: { id: skill.id } },
                        },
                        relations: ['question'],
                    });

                    totalSkill += totalSkillCount;

                    const correctSkillCount =
                        await this.examAttemptDetailRepository.count({
                            where: {
                                examAttempt: { id: examAttemptId },
                                iscorrect: true,
                                question: { skill: { id: skill.id } },
                            },
                            relations: ['question'],
                        });

                    const incorrectSkillCount =
                        await this.examAttemptDetailRepository.count({
                            where: {
                                examAttempt: { id: examAttemptId },
                                iscorrect: false,
                                question: { skill: { id: skill.id } },
                            },
                            relations: ['question'],
                        });

                    totalCorrect += correctSkillCount;
                    totalIncorrect += incorrectSkillCount;
                }

                const total = totalCorrect + totalIncorrect;
                const correctPercent = parseFloat(
                    ((totalCorrect * 100) / (total || 1)).toFixed(2),
                );
                const incorrectPercent = parseFloat(
                    ((totalIncorrect * 100) / (total || 1)).toFixed(2),
                );

                domainCounts.push({
                    domainId: domain.id,
                    domainContent: domain.content,
                    correctCount: totalCorrect,
                    incorrectCount: totalIncorrect,
                    total: total,
                    correctPercent: correctPercent,
                    incorrectPercent: incorrectPercent,
                });
            }

            // Skill
            const skillCounts = [];
            for (const domain of domains) {
                for (const skill of domain.skills) {
                    const totalSkillCount = await this.examAttemptDetailRepository.count({
                        where: {
                            examAttempt: { id: examAttemptId },
                            question: { skill: { id: skill.id } },
                        },
                        relations: ['question'],
                    });

                    const correctSkillCount =
                        await this.examAttemptDetailRepository.count({
                            where: {
                                examAttempt: { id: examAttemptId },
                                iscorrect: true,
                                question: { skill: { id: skill.id } },
                            },
                            relations: ['question'],
                        });

                    const incorrectSkillCount =
                        await this.examAttemptDetailRepository.count({
                            where: {
                                examAttempt: { id: examAttemptId },
                                iscorrect: false,
                                question: { skill: { id: skill.id } },
                            },
                            relations: ['question'],
                        });

                    const total = correctSkillCount + incorrectSkillCount;

                    skillCounts.push({
                        skillId: skill.id,
                        skillContent: skill.content,
                        correctCount: correctSkillCount,
                        incorrectCount: incorrectSkillCount,
                        total: total,
                        correctPercent: parseFloat(
                            ((correctSkillCount * 100) / (total || 1)).toFixed(2),
                        ),
                        incorrectPercent: parseFloat(
                            ((incorrectSkillCount * 100) / (total || 1)).toFixed(2),
                        ),
                    });
                }
            }

            const moduleTypeCounts = await this.examAttemptDetailRepository
                .createQueryBuilder('examAttemptDetail')
                .leftJoin('examAttemptDetail.question', 'question')
                .leftJoin('examAttemptDetail.examAttempt', 'examAttempt')
                .leftJoin('examAttempt.exam', 'exam')
                .leftJoin(
                    'exam.examquestion',
                    'examQuestion',
                    'examQuestion.exam = exam.id AND examQuestion.question = question.id',
                )
                .leftJoin('examQuestion.moduleType', 'moduleType')
                .leftJoin('moduleType.section', 'section')
                .select('moduleType.id', 'moduleTypeId')
                .addSelect('moduleType.name', 'moduleTypeName')
                .addSelect(
                    `SUM(CASE WHEN examAttemptDetail.iscorrect = true THEN 1 ELSE 0 END)`,
                    'correctCount',
                )
                .addSelect(
                    `SUM(CASE WHEN examAttemptDetail.iscorrect = false THEN 1 ELSE 0 END)`,
                    'incorrectCount',
                )
                .addSelect(`COUNT(examAttemptDetail.id)`, 'totalCount')
                .where('examAttemptDetail.examAttempt = :examAttemptId', {
                    examAttemptId,
                })
                .andWhere('exam.id = :examId', { examId })
                .andWhere('section.id = :sectionId', { sectionId })
                .groupBy('moduleType.id')
                .getRawMany();

            statistics[sectionKey] = {
                domain: domainCounts,
                skill: skillCounts,
                moduleType: moduleTypeCounts,
            };
        }

        return statistics;
    }
}
