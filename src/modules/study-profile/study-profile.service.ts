import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { BaseService } from '../base/base.service';
import { ExamAttempt } from 'src/database/entities/examattempt.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';
import { AssignStudyProfile } from './dto/asign-studyprofile.dto';
import { plainToInstance } from 'class-transformer';
import { GetAccountDTO } from '../account/dto/get-account.dto';
import { TargetLearning } from 'src/database/entities/targetlearning.entity';

@Injectable()
export class StudyProfileService {
    constructor(
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
    ) {}

    async getStudyProfileByAccountId(accountId: string) {
        return await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });
    }

    async getStudyProfileWithAccountId(
        accountId: string,
        page: number,
        pageSize: number,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository.findAndCount({
            where: { account: { id: accountId } },
            relations: ['account'],
            skip,
            take: pageSize,
            order: { updatedat: 'DESC' },
        });

        const studyProfilesWithAccount = studyProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            return {
                ...profile,
                account,
            };
        });

        const totalPages = Math.ceil(total / pageSize);

        return {
            data: studyProfilesWithAccount,
            currentPage: page,
            totalItems: total,
            totalPages,
        };
    }

    async create(accountId: string) {
        const studyProfile = await this.studyProfileRepository.create({
            account: { id: accountId },
            startdate: new Date(),
        });

        return await this.studyProfileRepository.save(studyProfile);
    }

    async saveTarget(targetRW: number, targetMath: number, accountId: string) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: accountId } },
            order: { createdat: 'ASC' },
            relations: ['targetlearning'],
        });

        studyProfile.targetscoreMath = targetMath;
        studyProfile.targetscoreRW = targetRW;
        studyProfile.status = StudyProfileStatus.ACTIVE;

        const save = await this.studyProfileRepository.save(studyProfile);
        return save;
    }

    async asignTeacher(assignStudyProfile: AssignStudyProfile) {
        const studyArr = [];

        for (const studyData of assignStudyProfile.studyProfiles) {
            const studyProfile = await this.studyProfileRepository.findOne({
                where: {
                    id: studyData.studyProfileId,
                    status: StudyProfileStatus.ACTIVE,
                },
            });

            if (!studyProfile) {
                throw new NotFoundException('StudyProfile is not found');
            }

            studyProfile.teacherId = assignStudyProfile.teacherId;

            studyArr.push(studyProfile);
        }

        return await this.studyProfileRepository.save(studyArr);
    }

    async get(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account')
            .where('studyProfile.status = :status', { status: StudyProfileStatus.ACTIVE })
            .skip(skip)
            .take(pageSize)
            .orderBy('studyProfile.updatedat', 'DESC')
            .getManyAndCount();

        const totalPages = Math.ceil(total / pageSize);

        const studyProfile = studyProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            return {
                ...profile,
                account,
            };
        });

        return {
            data: studyProfile,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async getWithTeacher(
        page: number,
        pageSize: number,
        teacherId: string,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account')
            .where('studyProfile.status = :status', {
                status: StudyProfileStatus.ACTIVE,
                teacherId: teacherId,
            })
            .andWhere('studyProfile.teacherId IS NOT NULL')
            .skip(skip)
            .take(pageSize)
            .orderBy('studyProfile.updatedat', 'DESC')
            .getManyAndCount();

        const totalPages = Math.ceil(total / pageSize);

        const studyProfile = studyProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            return {
                ...profile,
                account,
            };
        });

        return {
            data: studyProfile,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async getStudyProfileWithTargetLearningDetail(accountId: string) {
        const studyProfiles = await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });

        const targetLearningArrs = [];

        for (const studyProfile of studyProfiles) {
            const targetLearnings = await this.targetLearningRepository.find({
                where: { studyProfile: { id: studyProfile.id } },
                relations: [
                    'targetlearningdetail',
                    'targetlearningdetail.level',
                    'targetlearningdetail.section',
                    'targetlearningdetail.unitprogress',
                ],
            });

            const formattedTargetLearnings = targetLearnings.map((targetLearning) => ({
                ...targetLearning,
                targetlearningdetail: targetLearning.targetlearningdetail.map(
                    (detail) => ({
                        ...detail,
                        unitprogressCount: detail.unitprogress?.length || 0,
                    }),
                ),
            }));

            targetLearningArrs.push(...formattedTargetLearnings);
        }

        return targetLearningArrs;
    }
}
