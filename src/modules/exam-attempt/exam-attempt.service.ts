import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateExamAttemptDto } from './dto/create-examattempt.dto';
import { UpdateExamAttemptDto } from './dto/update-examattempt.dto';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { TargetLearningService } from '../target-learning/target-learning.service';
import { CreateTargetLearningDto } from '../target-learning/dto/create-targetlearning.dto';
import { Level } from 'src/database/entities/level.entity';
import { Section } from 'src/database/entities/section.entity';
import { UnitProgressService } from '../unit-progress/unit-progress.service';
import { Unit } from 'src/database/entities/unit.entity';
import { Domain } from 'src/database/entities/domain.entity';
import { ExamAttemptDetail } from 'src/database/entities/examattemptdetail.entity';

@Injectable()
export class ExamAttemptService {
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

        private readonly targetLearningService: TargetLearningService,
        private readonly unitProgressService: UnitProgressService,
    ) {}

    async recommend(examAttemptId: string, createTargetLearningDto: CreateTargetLearningDto) {
        const examAttempt = await this.examAttemptRepository.findOne({
            where: { id: examAttemptId },
            relations: ['studyProfile'],
        });

        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const domainErrorCounts = [];

        for (const domain of domainsRW) {
            let totalErrors = 0;

            for (const skill of domain.skills) {
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

            domainErrorCounts.push({ id: domain.id, domain: domain.content, totalErrors });
        }

        domainErrorCounts.sort((a, b) => b.totalErrors - a.totalErrors);
        const top3DomainsRW = domainErrorCounts.slice(0, 3);

        const top3DomainIdsRW = top3DomainsRW.map((domain) => domain.id);

        //Math
        const domainErrorCountsMath = [];
        const domainsMath = await this.domainRepository.find({
            where: { section: { name: 'Math' } },
            relations: ['skills'],
        });

        for (const domain of domainsMath) {
            let total = 0;

            for (const skill of domain.skills) {
                const skillErrorCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: false,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                total += skillErrorCount;
            }

            domainErrorCountsMath.push({ id: domain.id, domain: domain.content, total });
        }

        domainErrorCountsMath.sort((a, b) => b.totalErrors - a.totalErrors);
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
            },
        });

        const allUnitsMediumRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: medium.id },
                domain: { id: In(domainIdsRW) },
            },
        });

        const top3UnitsMediumRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: medium.id },
                domain: { id: In(top3DomainIdsRW) },
            },
        });

        const top3UnitsAdvanceRW = await this.unitRepository.find({
            where: {
                section: { id: RW.id },
                level: { id: advance.id },
                domain: { id: In(top3DomainIdsRW) },
            },
        });

        //Math

        const allUnitsFoundationMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: foundation.id },
                domain: { id: In(domainIdsMath) },
            },
        });

        const allUnitsMediumMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: medium.id },
                domain: { id: In(domainIdsMath) },
            },
        });

        const top3UnitsMediumMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: medium.id },
                domain: { id: In(top3DomainsMathIds) },
            },
        });

        const top3UnitsAdvanceMath = await this.unitRepository.find({
            where: {
                section: { id: math.id },
                level: { id: advance.id },
                domain: { id: In(top3DomainsMathIds) },
            },
        });

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

        //Math
        switch (true) {
            case examAttempt.scoreMath < 400:
                createTargetLearningDto.levelId = foundation.id;

                createTargetLearningDto.sectionId = math.id;

                const targetLearning =
                    await this.targetLearningService.save(createTargetLearningDto);

                console.log(targetLearning);

                console.log('case 1 Math');

                await this.unitProgressService.startMultipleUnitProgress(
                    targetLearning.id,
                    unitIdFoundationsMath,
                );

                break;

            case examAttempt.studyProfile.targetscoreMath >= 400 &&
                examAttempt.studyProfile.targetscoreMath < 600:
                if (examAttempt.scoreMath < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 2 Math');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdMediumMath,
                    );
                }
                break;

            case examAttempt.studyProfile.targetscoreMath >= 600 &&
                examAttempt.studyProfile.targetscoreMath < 800:
                if (examAttempt.scoreMath > 400 && examAttempt.scoreMath < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 3 Math');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        unitIdMediumMath,
                    );
                } else if (examAttempt.scoreMath < 800) {
                    createTargetLearningDto.levelId = advance.id;

                    createTargetLearningDto.sectionId = math.id;

                    console.log('case 4 Math');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdAdvanceMath,
                    );
                }
                break;
        }

        //RW
        switch (true) {
            case examAttempt.scoreRW < 400:
                createTargetLearningDto.levelId = foundation.id;

                createTargetLearningDto.sectionId = RW.id;

                console.log('case 1 RW');

                const targetLearning =
                    await this.targetLearningService.save(createTargetLearningDto);

                await this.unitProgressService.startMultipleUnitProgress(
                    targetLearning.id,
                    unitIdFoundationsRW,
                );

                break;

            case examAttempt.studyProfile.targetscoreRW >= 400 &&
                examAttempt.studyProfile.targetscoreRW < 600:
                if (examAttempt.scoreRW < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 2 RW');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdMediumsRW,
                    );
                }
                break;

            case examAttempt.studyProfile.targetscoreRW >= 600 &&
                examAttempt.studyProfile.targetscoreRW < 800:
                if (examAttempt.scoreRW > 400 && examAttempt.scoreRW < 600) {
                    createTargetLearningDto.levelId = medium.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 3 RW');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        unitIdMediumsRW,
                    );
                } else if (examAttempt.scoreRW < 800) {
                    createTargetLearningDto.levelId = advance.id;

                    createTargetLearningDto.sectionId = RW.id;

                    console.log('case 4 RW');

                    const targetLearning =
                        await this.targetLearningService.save(createTargetLearningDto);

                    await this.unitProgressService.startMultipleUnitProgress(
                        targetLearning.id,
                        top3UnitIdAdvanceRW,
                    );
                }
                break;
        }
    }

    //RW
    async getExamAtemptDomainRW(examAttemptId: string, iscorrect: boolean) {
        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const domainCounts = [];
        let allSkills = 0;
        let totalSkill = 0;
        let total = 0;

        for (const domain of domainsRW) {
            for (const skill of domain.skills) {
                const skillCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                total += skillCount;

                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkill += allSkills;
            }
            domainCounts.push({ doaminId: domain.id, domainContent: domain.content, count: total });
        }

        allSkills += totalSkill;

        let percent = (total * 100) / allSkills || 0;

        domainCounts.push({ percent: percent });

        return domainCounts;
    }

    async getExamAtemptsSkillRW(examAttemptId: string, iscorrect: boolean) {
        const domainsRW = await this.domainRepository.find({
            where: { section: { name: 'Reading & Writing' } },
            relations: ['skills'],
        });

        const skillCounts = [];
        let countAllSkill = 0;
        for (const domain of domainsRW) {
            for (const skill of domain.skills) {
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
        let total = 0;
        let totalSkill = 0;
        let allSkills = 0;

        for (const domain of domainsMath) {
            for (const skill of domain.skills) {
                const skillCount = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        iscorrect: iscorrect,
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                total += skillCount;

                const allSkills = await this.examAttemptDetailRepository.count({
                    where: {
                        examAttempt: { id: examAttemptId },
                        question: { skill: { id: skill.id } },
                    },
                    relations: ['question'],
                });

                totalSkill += allSkills;
            }

            domainCounts.push({ doaminId: domain.id, domainContent: domain.content, count: total });
        }

        allSkills += totalSkill;
        let percent = (total * 100) / allSkills || 0;

        domainCounts.push({ percent: percent });

        return domainCounts;
    }

    async getExamAtemptsSkillMath(examAttemptId: string, iscorrect: boolean) {
        const domainsMath = await this.domainRepository.find({
            where: { section: { name: 'Math' } },
            relations: ['skills'],
        });

        const skillCounts = [];
        for (const domain of domainsMath) {
            for (const skill of domain.skills) {
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
                });
            }
        }
        return skillCounts;
    }
}
