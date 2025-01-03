import { format, toZonedTime } from 'date-fns-tz';
import { CreateCertifyDto } from './dto/create-certify.dto';
import { UpdateDateDto } from './dto/update-date.dto';
import { CreateExamWithExamAttemptDto } from './../exam/dto/create-examwithattempt.dto';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
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
import { DomainDistribution } from 'src/database/entities/domaindistribution.entity';
import { ModuleType } from 'src/database/entities/moduletype.entity';
import { StudyProfileService } from '../study-profile/study-profile.service';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';
import { GetAccountDTO } from '../account/dto/get-account.dto';
import { FeedbackType } from 'src/common/enums/feedback-type.enum';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { NotificationService } from 'src/modules/notification/notification.service';

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
        private readonly notificationService: NotificationService,
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
            order: { createdat: 'DESC' },
            relations: ['targetlearning'],
        });

        if (!studyProfile) {
            throw new NotFoundException('StudyProfile is not found');
        }

        let target = new TargetLearning();
        let updateStudyProfile;

        if (studyProfile.status === StudyProfileStatus.INACTIVE) {
            target = await this.targetLearningService.save(
                studyProfile.id,
                examAttemptId,
            );

            updateStudyProfile = await this.studyProfileService.saveTarget(
                createTargetLearningDto.targetLearningRW,
                createTargetLearningDto.targetLearningMath,
                accountId,
            );
        } else if (studyProfile.status === StudyProfileStatus.ACTIVE) {
            target = await this.targetLearningService.updateTargetLearning(
                studyProfile.id,
                examAttemptId,
            );
        }

        if (
            studyProfile.status === StudyProfileStatus.ACTIVE &&
            target.enddate > studyProfile.enddate
        ) {
            await this.targetLearningService.updateTargetLearningWithStudyProfile(
                studyProfile.id,
                target.id,
            );
        }

        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: [
                'targetlearning',
                'targetlearning.studyProfile',
                'exam',
                'exam.examType',
            ],
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

                if (examAttempt.exam.examType.name === 'Trial Exam') {
                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }

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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                if (examAttempt.exam.examType.name === 'Trial Exam') {
                    await this.studyProfileService.updateDate(updateStudyProfile.id, 6);
                }

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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                    if (examAttempt.exam.examType.name === 'Trial Exam') {
                        await this.studyProfileService.updateDate(
                            updateStudyProfile.id,
                            6,
                        );
                    }
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

                    await this.notificationService.createAndSendNotification(
                        studyProfile.teacherId,
                        null,
                        studyProfile,
                        `Student ${account.username} have complete the ${exam.title}`,
                        FeedbackType.EXAM,
                        FeedbackEventType.EXAM_ATTEMPT,
                    );

                    await this.notificationService.createAndSendNotification(
                        account.id,
                        null,
                        studyProfile,
                        `You have complete the ${exam.title}`,
                        FeedbackType.EXAM,
                        FeedbackEventType.EXAM_ATTEMPT,
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

            const staffs = await this.accountRepository.find({
                where: { role: { rolename: 'Staff' } },
            });

            await this.notificationService.createAndSendMultipleNotifications(
                staffs,
                null,
                studyProfile,
                `Student ${account.username} has completed the exam ${exam.title}`,
                FeedbackType.EXAM,
                FeedbackEventType.EXAM_ATTEMPT,
            );

            await this.notificationService.createAndSendNotification(
                account.id,
                null,
                studyProfile,
                `You have complete the ${exam.title}`,
                FeedbackType.EXAM,
                FeedbackEventType.EXAM_ATTEMPT,
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

    async getExamAttemptByStudyProfile(accountId: string) {
        const studyProfiles = await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });

        if (!studyProfiles.length) {
            throw new NotFoundException('StudyProfile is not found');
        }

        const examAttemptArrs = [];
        const timeZone = 'Asia/Ho_Chi_Minh';

        const currentDate = new Date();
        const currentTimeInTimeZone = toZonedTime(currentDate, timeZone);
        const currentTime = format(currentTimeInTimeZone, 'yyyy-MM-dd HH:mm:ssXXX', {
            timeZone,
        });

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

                    examAttempt.exam = {
                        ...examAttempt.exam,
                        ...examDetails,
                    };

                    examAttemptArrs.push(examAttempt);
                }
            }
        }

        return {
            examAttemptArrs,
            currentTime,
        };
    }

    async createExamAttemptWithExam(
        accountFromId: string,
        createExamDto: CreateExamWithExamAttemptDto,
    ) {
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

        const savedExamAttemptArrs =
            await this.examAttemptRepository.save(examAttemptArrs);

        const notificationMessage = `You have been assigned the test: ${exam.title}`;

        const listAccountTo = await this.getAccountByStudyProfileId(
            createExamDto.studyProfileIds,
        );
        await this.notificationService.createAndSendMultipleNotificationsNew(
            listAccountTo,
            accountFromId,
            savedExamAttemptArrs,
            notificationMessage,
            FeedbackType.EXAM,
            FeedbackEventType.ASSIGN_EXAM,
        );

        return savedExamAttemptArrs;
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
                const vietnamDate = new Date(utcDate.getTime());
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
                const vietnamDate = new Date(utcDate.getTime());
                item.attemptdatetime = vietnamDate;
            }
            return item;
        });

        return transformedResult;
    }

    async getAllExamAttemptByStudyProfile(studyProfileId: string) {
        const studyProfiles = await this.studyProfileRepository.findOne({
            where: { id: studyProfileId },
        });

        if (!studyProfiles) {
            throw new NotFoundException('StudyProfile is not found');
        }

        const examAttemptArrs = [];

        const targetLearnings = await this.targetLearningRepository
            .createQueryBuilder('targetLearning')
            .select(['targetLearning.id'])
            .where('targetLearning.studyProfile = :studyProfileId', { studyProfileId })
            .getMany();

        const allExamAttempts = [];

        for (const targetLearningData of targetLearnings) {
            const examAttempt = await this.examAttemptRepository.findOne({
                where: { targetlearning: { id: targetLearningData.id }, status: true },
                relations: ['exam'],
                order: { attemptdatetime: 'DESC' },
            });

            if (examAttempt) {
                const utcDate = new Date(examAttempt.attemptdatetime);
                const vietnamDate = new Date(utcDate.getTime());

                const scoreTotal =
                    (examAttempt.scoreMath || 0) + (examAttempt.scoreRW || 0);
                allExamAttempts.push({
                    ...examAttempt,
                    attemptdatetime: vietnamDate,
                    scoreTotal,
                    targetLearningId: targetLearningData.id,
                });
            }
        }

        allExamAttempts.sort(
            (a, b) =>
                new Date(b.attemptdatetime).getTime() -
                new Date(a.attemptdatetime).getTime(),
        );

        for (let i = 0; i < allExamAttempts.length; i++) {
            const currentAttempt = allExamAttempts[i];
            const previousAttempt = allExamAttempts[i + 1] || null;

            const improvement = previousAttempt
                ? (currentAttempt.scoreTotal || 0) - (previousAttempt.scoreTotal || 0)
                : 0;

            examAttemptArrs.push({
                ...currentAttempt,
                improvement,
            });
        }

        return examAttemptArrs;
    }

    async getReport(examAttemptId: string) {
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['exam', 'examattemptdetail', 'examattemptdetail.question'],
        });

        if (!examAttempt || !examAttempt.exam) {
            throw new NotFoundException(`ExamAttempt with ID ${examAttemptId} not found`);
        }

        const examId = examAttempt.exam.id;

        const modules = await this.moduleTypeRepository
            .createQueryBuilder('moduleType')
            .innerJoinAndSelect('moduleType.examquestion', 'examQuestion')
            .innerJoinAndSelect('examQuestion.question', 'question')
            .innerJoin('examQuestion.exam', 'exam', 'exam.id = :examId', { examId })
            .leftJoinAndSelect('question.answers', 'answers')
            .leftJoinAndSelect('question.skill', 'skill')
            .leftJoinAndSelect('skill.domain', 'domain')
            .leftJoinAndSelect('moduleType.section', 'moduleSection')
            .where('question.id IN (:...questionIds)', {
                questionIds: examAttempt.examattemptdetail.map(
                    (detail) => detail.question.id,
                ),
            })
            .orderBy('moduleType.updatedat', 'DESC')
            .getMany();

        const moduleDetails = modules.map((module) => {
            const questions = module.examquestion
                .filter((examQuestion) =>
                    examAttempt.examattemptdetail.some(
                        (detail) => detail.question.id === examQuestion.question.id,
                    ),
                )
                .map((examQuestion) => {
                    const attemptDetail = examAttempt.examattemptdetail.find(
                        (detail) => detail.question.id === examQuestion.question.id,
                    );

                    return {
                        questionId: examQuestion.question.id,
                        content: examQuestion.question.content,
                        isCorrect: attemptDetail?.iscorrect || false,
                        studentAnswer: attemptDetail?.studentAnswer || null,
                        correctAnswers: examQuestion.question.answers?.filter(
                            (answer) => answer.isCorrectAnswer,
                        ),
                        explain: examQuestion.question.explain,
                        answer: examQuestion.question.answers,
                        skill: {
                            id: examQuestion.question.skill?.id,
                            name: examQuestion.question.skill?.content,
                        },
                        domain: {
                            id: examQuestion.question.skill?.domain?.id,
                            name: examQuestion.question.skill?.domain?.content,
                        },
                    };
                });

            return {
                moduleId: module.id,
                moduleName: module.name,
                section: module.section?.name || '',
                time: module.time,
                numberOfQuestions: questions.length,
                questions,
            };
        });

        const sectionOrder = { 'Reading & Writing': 1, Math: 2 };
        const moduleOrder = { 'Module 1': 1, 'Module 2': 2 };

        moduleDetails.sort((a, b) => {
            return (
                sectionOrder[a.section] - sectionOrder[b.section] ||
                moduleOrder[a.moduleName] - moduleOrder[b.moduleName]
            );
        });

        const totalNumberOfQuestions = moduleDetails.reduce(
            (total, module) => total + module.numberOfQuestions,
            0,
        );
        const totalTime = moduleDetails.reduce(
            (total, module) => total + (module.time || 0),
            0,
        );

        return {
            id: examAttempt.exam.id,
            examTitle: examAttempt.exam.title,
            totalNumberOfQuestions,
            totalTime,
            modules: moduleDetails,
        };
    }

    private async getAccountByStudyProfileId(
        studyProfileId: string[],
    ): Promise<string[]> {
        const accounts = await this.studyProfileRepository.find({
            where: { id: In(studyProfileId) },
            relations: ['account'],
        });

        return accounts.map((studyProfile) => studyProfile.account.id);
    }

    async updateDateExamAttempt(
        accountFromId: string,
        updateDate: UpdateDateDto,
    ): Promise<any> {
        const targetLearning = await this.targetLearningRepository.findOne({
            where: { id: updateDate.targetLeaningId },
            relations: ['studyProfile', 'studyProfile.account'],
        });

        const examAttempt = await this.examAttemptRepository.findOne({
            where: { targetlearning: { id: targetLearning.id } },
            relations: ['exam'],
        });

        examAttempt.attemptdatetime = updateDate.attemptdatetime;

        const update = await this.examAttemptRepository.save(examAttempt);

        let notificationMessage = `Your ${examAttempt.exam.title} has been rescheduled to ${format(updateDate.attemptdatetime, 'dd-MM-yyyy')}`;

        await this.notificationService.createAndSendNotification(
            targetLearning.studyProfile.account.id,
            accountFromId,
            update,
            notificationMessage,
            FeedbackType.EXAM,
            FeedbackEventType.ASSIGN_EXAM,
        );

        return update;
    }

    async createExamAttemptCertified(createCertify: CreateCertifyDto) {
        const createTargetLearning = await this.targetLearningRepository.create({
            studyProfile: { id: createCertify.studyProfileId },
            startdate: createCertify.attemptdatetime,
            enddate: createCertify.attemptdatetime,
            status: TargetLearningStatus.CERTIFIED,
        });

        const saveTarget = await this.targetLearningRepository.save(createTargetLearning);

        const createExamAttempt = await this.examAttemptRepository.create({
            targetlearning: { id: saveTarget.id },
            attemptdatetime: createCertify.attemptdatetime,
            scoreMath: createCertify.scorMath,
            scoreRW: createCertify.scoreRW,
            status: true,
        });

        const saveExamAttempt = await this.examAttemptRepository.save(createExamAttempt);
        return saveExamAttempt;
    }
}
