import { CreateExamWithExamAttemptDto } from './../exam/dto/create-examwithattempt.dto';
import sanitizeHtml from 'sanitize-html';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { BaseService } from '../base/base.service';
import { TargetLearningDetailService } from '../target-learning-detail/target-learning-detail.service';
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
import { AssignExamAttemptDto } from './dto/assign-examattempt.dto';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';
import moment from 'moment-timezone';
import { GetAccountDTO } from '../account/dto/get-account.dto';

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
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,

        private readonly targetLearningDetailService: TargetLearningDetailService,
        @Inject(forwardRef(() => TargetLearningService))
        private readonly targetLearningService: TargetLearningService,
        @Inject(forwardRef(() => UnitProgressService))
        private readonly unitProgressService: UnitProgressService,
        @Inject(forwardRef(() => ExamAttemptDetailService))
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
            where: { account: { id: accountId }, status: StudyProfileStatus.INACTIVE },
            order: { createdat: 'ASC' },
        });

        const target = await this.targetLearningService.save(
            studyProfile.id,
            examAttemptId,
        );

        if (!studyProfile) {
            throw new NotFoundException('StudyProfile is not found');
        }

        const updateStudyProfile = await this.studyProfileService.saveTarget(
            createTargetLearningDto.targetLearningRW,
            createTargetLearningDto.targetLearningMath,
            accountId,
        );

        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['targetlearning', 'targetlearning.studyProfile'],
        });

        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const domainErrorCounts = [];

        for (const domain of domainsRW) {
            let totalErrors = 0;
            let totalSkills = 0;

            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkills += allSkills;

                const skillErrorCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: false,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalErrors += skillErrorCount;
            }

            const percent = (totalErrors * 100) / totalSkills;

            domainErrorCounts.push({
                id: domain.id,
                domain: domain.content,
                totalErrors,
                percent,
            });
        }

        domainErrorCounts.sort((a, b) => b.percent - a.percent);
        const top3DomainsRW = domainErrorCounts.slice(0, 3);

        const top3DomainIdsRW = top3DomainsRW.map((domain) => domain.id);

        //Math
        const domainErrorCountsMath = [];
        const domainsMath = await this.domainRepository.find({
            where: { section: { name: 'Math' } },
            relations: ['skills'],
        });

        for (const domain of domainsMath) {
            let totalErrors = 0;
            let totalSkills = 0;

            for (const skill of domain.skills) {
                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkills += allSkills;

                const skillErrorCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: false,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalErrors += skillErrorCount;
            }

            const percent = (totalErrors * 100) / totalSkills;

            domainErrorCountsMath.push({
                id: domain.id,
                domain: domain.content,
                totalErrors,
                percent,
            });
        }

        domainErrorCountsMath.sort((a, b) => b.percent - a.percent);
        const top3DomainsMath = domainErrorCountsMath.slice(0, 3);

        const top3DomainsMathIds = top3DomainsMath.map((domain) => domain.id);

        const [foundation, medium, advance] = await Promise.all([
            this.levelRepository.findOne({ where: { name: 'Foundation' } }),
            this.levelRepository.findOne({ where: { name: 'Medium' } }),
            this.levelRepository.findOne({ where: { name: 'Advance' } }),
        ]);

        const [math, RW] = await Promise.all([
            this.sectionRepository.findOne({ where: { name: 'Math' } }),
            this.sectionRepository.findOne({ where: { name: 'Reading & Writing' } }),
        ]);

        const domainIdsRW = domainsRW.map((domain) => domain.id);

        const domainIdsMath = domainsMath.map((domain) => domain.id);

        //RW
        const allUnitsFoundationRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: foundation.id },
                domain: { id: In(domainIdsRW) },
                status: UnitStatus.APPROVED,
            },
        });

        const allUnitsMediumRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: medium.id },
                domain: { id: In(domainIdsRW) },
                status: UnitStatus.APPROVED,
            },
        });

        const top3UnitsMediumRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: medium.id },
                domain: { id: In(top3DomainIdsRW) },
                status: UnitStatus.APPROVED,
            },
        });

        const top3UnitsAdvanceRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: advance.id },
                domain: { id: In(top3DomainIdsRW) },
                status: UnitStatus.APPROVED,
            },
        });

        //Math

        const allUnitsFoundationMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: foundation.id },
                domain: { id: In(domainIdsMath) },
                status: UnitStatus.APPROVED,
            },
        });

        const allUnitsMediumMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: medium.id },
                domain: { id: In(domainIdsMath) },
                status: UnitStatus.APPROVED,
            },
        });

        const top3UnitsMediumMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: medium.id },
                domain: { id: In(top3DomainsMathIds) },
                status: UnitStatus.APPROVED,
            },
        });

        const top3UnitsAdvanceMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: advance.id },
                domain: { id: In(top3DomainsMathIds) },
                status: UnitStatus.APPROVED,
            },
        });

        console.log(top3DomainsMathIds);
        console.log(top3UnitsAdvanceMath);

        // RW
        const unitIdFoundationsRW = allUnitsFoundationRW.map((unit) => unit.id);
        const unitIdMediumsRW = allUnitsMediumRW.map((unit) => unit.id);
        const top3UnitIdMediumsRW = top3UnitsMediumRW.map((unit) => unit.id);
        const top3UnitIdAdvanceRW = top3UnitsAdvanceRW.map((unit) => unit.id);

        //Math
        const unitIdFoundationsMath = allUnitsFoundationMath.map((unit) => unit.id);
        const unitIdMediumMath = allUnitsMediumMath.map((unit) => unit.id);
        const top3UnitIdMediumMath = top3UnitsMediumMath.map((unit) => unit.id);
        const top3UnitIdAdvanceMath = top3UnitsAdvanceMath.map((unit) => unit.id);

        const result = {
            Math: null,
            RW: null,
        };

        //Math
        switch (true) {
            case examAttempt.scoreMath < 400:
                createTargetLearningDto.levelId = foundation.id;

                createTargetLearningDto.sectionId = math.id;

                const targetLearning = await this.targetLearningDetailService.save(
                    createTargetLearningDto,
                    target.id,
                );

                console.log('case 1 Math');

                result.Math = await this.unitProgressService.startMultipleUnitProgress(
                    targetLearning.id,
                    unitIdFoundationsMath,
                );

                await this.studyProfileService.updateDate(updateStudyProfile.id, 6);

                break;

            case examAttempt.targetlearning.studyProfile.targetscoreMath >= 400 &&
                examAttempt.targetlearning.studyProfile.targetscoreMath < 600:
                if (examAttempt.scoreMath < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 2 Math');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.Math =
                        await this.unitProgressService.startMultipleUnitProgress(
                            targetLearning.id,
                            top3UnitIdMediumMath,
                        );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }
                break;

            case examAttempt.targetlearning.studyProfile.targetscoreMath >= 600 &&
                examAttempt.targetlearning.studyProfile.targetscoreMath < 800:
                if (examAttempt.scoreMath > 400 && examAttempt.scoreMath < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 3 Math');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.Math =
                        await this.unitProgressService.startMultipleUnitProgress(
                            targetLearning.id,
                            unitIdMediumMath,
                        );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                } else if (examAttempt.scoreMath < 800) {
                    createTargetLearningDto.levelId = advance.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 4 Math');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.Math =
                        await this.unitProgressService.startMultipleUnitProgress(
                            targetLearning.id,
                            top3UnitIdAdvanceMath,
                        );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }
                break;
        }

        //RW
        switch (true) {
            case examAttempt.scoreRW < 400:
                createTargetLearningDto.levelId = foundation.id;

                createTargetLearningDto.sectionId = RW.id;

                console.log('case 1 RW');

                const targetLearning = await this.targetLearningDetailService.save(
                    createTargetLearningDto,
                    target.id,
                );

                result.RW = await this.unitProgressService.startMultipleUnitProgress(
                    targetLearning.id,
                    unitIdFoundationsRW,
                );

                await this.studyProfileService.updateDate(updateStudyProfile.id, 6);

                break;

            case examAttempt.targetlearning.studyProfile.targetscoreRW >= 400 &&
                examAttempt.targetlearning.studyProfile.targetscoreRW < 600:
                if (examAttempt.scoreRW < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 2 RW');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.RW = await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdMediumsRW,
                    );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }
                break;

            case examAttempt.targetlearning.studyProfile.targetscoreRW >= 600 &&
                examAttempt.targetlearning.studyProfile.targetscoreRW < 800:
                if (examAttempt.scoreRW > 400 && examAttempt.scoreRW < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 3 RW');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.RW = await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        unitIdMediumsRW,
                    );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                } else if (examAttempt.scoreRW < 800) {
                    createTargetLearningDto.levelId = advance.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 4 RW');

                    const targetLearning = await this.targetLearningDetailService.save(
                        createTargetLearningDto,
                        target.id,
                    );

                    result.RW = await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdAdvanceRW,
                    );

                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }
                break;
        }

        return result;
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

        const studyProfile = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.targetlearning', 'targetlearning')
            .leftJoinAndSelect('targetlearning.examattempt', 'examattempt')
            .where('studyProfile.account.id = :accountId', { accountId: account.id })
            .andWhere('targetlearning.status = :status', {
                status: TargetLearningStatus.INACTIVE,
            })
            .getOne();

        if (studyProfile) {
            for (const targetLearning of studyProfile.targetlearning) {
                if (targetLearning.examattempt) {
                    const examAttempt = targetLearning.examattempt;

                    examAttempt.scoreRW = scoreRW;
                    examAttempt.scoreMath = scoreMath;
                    examAttempt.status = true;
                    const updateExamAttempt =
                        await this.examAttemptRepository.save(examAttempt);

                    await this.examAttemptDetailService.check(
                        createExamAttemptDto.createExamAttemptDetail,
                        updateExamAttempt.id,
                    );

                    return plainToInstance(CreateExamAttemptDto, {
                        scoreMath: updateExamAttempt.scoreMath,
                        scoreRW: updateExamAttempt.scoreRW,
                        attemptId: updateExamAttempt.id,
                    });
                }
            }
        } else {
            const createExamAttempt = await this.examAttemptRepository.create({
                exam: exam,
                attemptdatetime: new Date(),
                scoreMath: scoreMath,
                scoreRW: scoreRW,
                status: true,
            });

            const savedExamAttempt =
                await this.examAttemptRepository.save(createExamAttempt);

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
    }

    // async getExamAttemptByStudyProfileId(accountId: string) {
    //     const studyProfile = await this.studyProfileRepository.findOne({
    //         where: { account: { id: accountId } },
    //         order: { createdat: 'ASC' },
    //     });

    //     const examAttempt = await this.examAttemptRepository.find({
    //         where: { studyProfile: { id: studyProfile.id } },
    //         relations: [
    //             'exam',
    //             'studyProfile',
    //             'exam.examquestion',
    //             'exam.examquestion.question',
    //         ],
    //     });

    //     if (!examAttempt) {
    //         throw new NotFoundException('ExamAttempt is not found');
    //     }

    //     const detailedExamAttempts = await Promise.all(
    //         examAttempt.map(async (attempt) => {
    //             const examDetails = await this.GetExamWithExamQuestionByExamId(
    //                 attempt.exam.id,
    //             );

    //             return {
    //                 ...attempt,
    //                 exam: examDetails,
    //             };
    //         }),
    //     );

    //     return detailedExamAttempts;
    // }

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
            .innerJoinAndSelect('examQuestion.exam', 'exam') // Thêm liên kết với exam
            .leftJoinAndSelect('question.level', 'level')
            .leftJoinAndSelect('question.skill', 'skill')
            .leftJoinAndSelect('skill.domain', 'domain')
            .leftJoinAndSelect('question.section', 'section')
            .leftJoinAndSelect('question.answers', 'answers')
            .leftJoinAndSelect('moduleType.section', 'moduleSection')
            .where('exam.id = :examId', { examId }) // Điều kiện đúng
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

                moduleDetails.push(module);
            }
        }

        return {
            id: exam.id,
            examTitle: exam.title,
            totalNumberOfQuestions,
            totalTime,
            //modules: moduleDetails,
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
                relations: ['skills', 'skills.domain'],
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
                        domain: skill.domain,
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
                score: sectionKey === 'RW' ? examAttempt.scoreRW : examAttempt.scoreMath,
                domain: domainCounts,
                skill: skillCounts,
                moduleType: moduleTypeCounts,
            };
        }

        return statistics;
    }

    // async assignExam(assignExamAttemptDto: AssignExamAttemptDto) {
    //     const create = this.examAttemptRepository.create({
    //         exam: { id: assignExamAttemptDto.examId },
    //         studyProfile: { id: assignExamAttemptDto.studyProfileId },
    //         attemptdatetime: assignExamAttemptDto.attempDate,
    //     });

    //     return await this.examAttemptRepository.save(create);
    // }

    async getExamAttemptByStudyProfile(accountId: string) {
        const studyProfiles = await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });

        if (!studyProfiles.length) {
            throw new NotFoundException('StudyProfile is not found');
        }

        const examAttemptArrs = [];

        for (const studyProfileData of studyProfiles) {
            const targetLearnings = await this.targetLearningRepository.find({
                where: { studyProfile: { id: studyProfileData.id } },
            });

            for (const targetLearningData of targetLearnings) {
                const examAttempt = await this.examAttemptRepository.findOne({
                    where: { targetlearning: { id: targetLearningData.id } },
                    relations: ['exam'],
                });

                if (examAttempt && examAttempt.exam) {
                    const examDetails = await this.GetExamWithExamQuestionByExamId(
                        examAttempt.exam.id,
                    );

                    // Gắn thông tin exam vào examAttempt
                    examAttempt.exam = {
                        ...examAttempt.exam,
                        ...examDetails,
                    };

                    examAttemptArrs.push(examAttempt);
                }
            }
        }

        return examAttemptArrs;
    }

    async createExamAttemptWithExam(createExamDto: CreateExamWithExamAttemptDto) {
        const exam = await this.examRepository.findOne({
            where: { id: createExamDto.examId },
        });

        if (!exam) {
            throw new Error('Exam not found');
        }

        const targetLearning =
            await this.targetLearningService.createMultipleTargetLearning(
                createExamDto.studyProfileIds,
            );

        const examAttemptArrs = targetLearning.map((targetData) =>
            this.examAttemptRepository.create({
                targetlearning: { id: targetData.id },
                exam: { id: createExamDto.examId },
                attemptdatetime: createExamDto.attemptdatetime,
            }),
        );

        return await this.examAttemptRepository.save(examAttemptArrs);
    }

    async getExamAttemptWithStudyProfileByTeacher(teacherId: string) {
        const result = await this.examAttemptRepository
            .createQueryBuilder('examAttempt')
            .leftJoinAndSelect('examAttempt.targetlearning', 'targetLearning')
            .leftJoinAndSelect('examAttempt.exam', 'exam')
            .leftJoinAndSelect('exam.examType', 'examType')
            .leftJoinAndSelect('targetLearning.studyProfile', 'studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account')
            .where('studyProfile.teacherId = :teacherId', { teacherId })
            .andWhere('examType.name != :excludedType', { excludedType: 'Trial Exam' })
            .getMany();

        const transformedResult = result.map((item) => {
            if (item.attemptdatetime) {
                const utcDate = new Date(item.attemptdatetime);
                const vietnamDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
                item.attemptdatetime = vietnamDate;
            }
            return item;
        });

        const groupedResult = transformedResult.reduce((acc, item) => {
            const key = `${item.attemptdatetime.toISOString()}_${item.exam.id}`;
            if (!acc[key]) {
                acc[key] = {
                    id: item.id,
                    createdat: item.createdat,
                    createby: item.createdby,
                    updatedat: item.updatedat,
                    updatedby: item.updatedby,
                    scoreMath: item.scoreMath,
                    scoreRW: item.scoreRW,
                    status: item.status,
                    attemptdatetime: item.attemptdatetime,
                    exam: item.exam,
                    targetlearning: item.targetlearning
                        ? [
                              {
                                  ...item.targetlearning,
                                  studyProfile: {
                                      ...item.targetlearning.studyProfile,
                                      account: plainToInstance(
                                          GetAccountDTO,
                                          item.targetlearning.studyProfile?.account,
                                          {
                                              excludeExtraneousValues: true,
                                          },
                                      ),
                                  },
                              },
                          ]
                        : [],
                };
            } else {
                acc[key].targetlearning.push({
                    ...item.targetlearning,
                    studyProfile: {
                        ...item.targetlearning.studyProfile,
                        account: plainToInstance(
                            GetAccountDTO,
                            item.targetlearning.studyProfile?.account,
                            {
                                excludeExtraneousValues: true,
                            },
                        ),
                    },
                });
            }
            return acc;
        }, {});

        const groupedArray = Object.values(groupedResult);

        return groupedArray;
    }

    async getExamAttemptWithStudyProfileByTeacherAndExam(
        teacherId: string,
        examId: string,
    ) {
        const result = await this.examAttemptRepository
            .createQueryBuilder('examAttempt')
            .leftJoinAndSelect('examAttempt.targetlearning', 'targetLearning')
            .leftJoinAndSelect('examAttempt.exam', 'exam')
            .leftJoinAndSelect('exam.examType', 'examType')
            .leftJoinAndSelect('targetLearning.studyProfile', 'studyProfile')
            .where('studyProfile.teacherId = :teacherId', { teacherId })
            .andWhere('exam.id = :examId', { examId })
            .andWhere('examType.name != :excludedType', { excludedType: 'Trial Exam' })
            .getMany();

        const transformedResult = result.map((item) => {
            if (item.attemptdatetime) {
                const utcDate = new Date(item.attemptdatetime);
                const vietnamDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
                item.attemptdatetime = vietnamDate;
            }
            return item;
        });

        return transformedResult;
    }
}
