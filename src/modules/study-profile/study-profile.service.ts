import { UpdateStudyProfileDto } from './dto/update-studyprofile.dto';
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
import { TargetLearningStatus } from 'src/common/enums/target-learning-status.enum';
import { TargetLearningDetailStatus } from 'src/common/enums/target-learning-status-enum';
import { Account } from 'src/database/entities/account.entity';
import { CreateStudyProfileDto } from './dto/create-studyprofile.dto';

@Injectable()
export class StudyProfileService {
    constructor(
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        @InjectRepository(TargetLearning)
        private readonly targetLearningRepository: Repository<TargetLearning>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    async getStudyProfileByAccountId(accountId: string) {
        return await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });
    }

    async getStudyProfileByAccountIdAndStatus(
        accountId: string,
        stauts: StudyProfileStatus,
    ) {
        return await this.studyProfileRepository.find({
            where: { account: { id: accountId }, status: stauts },
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

            const startdate = profile.startdate
                ? new Date(profile.startdate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            const enddate = profile.enddate
                ? new Date(profile.enddate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            return {
                ...profile,
                account,
                startdate,
                enddate,
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

            const startdate = profile.startdate
                ? new Date(profile.startdate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            const enddate = profile.enddate
                ? new Date(profile.enddate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            return {
                ...profile,
                account,
                startdate,
                enddate,
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

            const startdate = profile.startdate
                ? new Date(profile.startdate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            const enddate = profile.enddate
                ? new Date(profile.enddate).toLocaleDateString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            return {
                ...profile,
                account,
                startdate,
                enddate,
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

    async getStudyProfileWithTargetLearningDetailWithStatus(accountId: string) {
        const studyProfiles = await this.studyProfileRepository.find({
            where: { account: { id: accountId } },
        });

        const targetLearningArrs = [];

        for (const studyProfile of studyProfiles) {
            const targetLearnings = await this.targetLearningRepository.find({
                where: {
                    studyProfile: { id: studyProfile.id },
                    status: TargetLearningStatus.ACTIVE,
                },
                relations: [
                    'targetlearningdetail',
                    'targetlearningdetail.level',
                    'targetlearningdetail.section',
                    'targetlearningdetail.unitprogress',
                    // 'targetlearningdetail.unitprogress.unitAreaProgresses',
                    'targetlearningdetail.unitprogress.unitAreaProgresses.lessonProgresses',
                ],
            });

            const filteredTargetLearnings = targetLearnings.map((targetLearning) => {
                const updatedDetails = targetLearning.targetlearningdetail.map(
                    (detail) => {
                        const unitprogressCount = detail.unitprogress?.length || 0;

                        const lessonProgressCount = detail.unitprogress.reduce(
                            (sum, unitProgress) =>
                                sum +
                                unitProgress.unitAreaProgresses.reduce(
                                    (areaSum, unitArea) =>
                                        areaSum +
                                        (unitArea.lessonProgresses?.length || 0),
                                    0,
                                ),
                            0,
                        );

                        // const updatedUnitProgress = detail.unitprogress.map((unitProgress) => ({
                        //     unitarea: unitProgress.unitAreaProgresses.map((unitArea) => ({
                        //         lessonprogressCount: unitArea.lessonProgresses?.length || 0,
                        //     })),
                        // }));

                        return {
                            ...detail,
                            unitprogressCount,
                            lessonProgressCount,
                            //unitprogress: updatedUnitProgress,
                        };
                    },
                );

                return {
                    ...targetLearning,
                    targetlearningdetail: updatedDetails,
                };
            });

            targetLearningArrs.push(...filteredTargetLearnings);
        }

        return targetLearningArrs;
    }

    async getStudyProfileWithTeacherDetail(page: number, pageSize: number): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account') // Tham chiếu accountId
            .where('studyProfile.status = :status', { status: StudyProfileStatus.ACTIVE })
            .skip(skip)
            .take(pageSize)
            .orderBy('studyProfile.updatedat', 'DESC')
            .getManyAndCount();

        const teacherIds = studyProfiles.map((profile) => profile.teacherId);
        const teachers = await this.accountRepository.findByIds(teacherIds);

        const totalPages = Math.ceil(total / pageSize);

        const studyProfile = studyProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            const teacher = teachers.find((teacher) => teacher.id === profile.teacherId);

            const startdate = profile.startdate
                ? new Date(profile.startdate).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;
            const enddate = profile.enddate
                ? new Date(profile.enddate).toLocaleString('vi-VN', {
                      timeZone: 'Asia/Saigon',
                  })
                : null;

            return {
                ...profile,
                account,
                teacher: teacher
                    ? plainToInstance(GetAccountDTO, teacher, {
                          excludeExtraneousValues: true,
                      })
                    : null,
                startdate,
                enddate,
            };
        });

        return {
            data: studyProfile,
            totalPages: totalPages,
            currentPage: page,
            totalItems: total,
        };
    }

    async updateDate(studyProfileId: string, month: number) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { id: studyProfileId },
        });

        if (!studyProfile) {
            throw new Error('StudyProfile not found');
        }

        const startDate = new Date();
        studyProfile.startdate = startDate;

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + month);
        studyProfile.enddate = endDate;

        return await this.studyProfileRepository.save(studyProfile);
    }

    async updateStudyProfile(id: string, updateStudyProfileDto: UpdateStudyProfileDto) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { id: id },
        });

        if (!studyProfile) {
            throw new NotFoundException('StudyProfile is not found');
        }

        studyProfile.startdate = updateStudyProfileDto.startDate;
        studyProfile.enddate = updateStudyProfileDto.endDate;

        return await this.studyProfileRepository.save(studyProfile);
    }

    async getStudyProfileCompleteByTeacher(
        page: number,
        pageSize: number,
        teacherId: string,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account')
            .leftJoinAndSelect('studyProfile.targetlearning', 'targetLearning')
            .where('studyProfile.teacherId = :teacherId', { teacherId })
            .andWhere('studyProfile.status = :status', {
                status: StudyProfileStatus.ACTIVE,
            })
            .orderBy('targetLearning.createdat', 'DESC')
            .skip(skip)
            .take(pageSize)
            .getManyAndCount();

        const totalPages = Math.ceil(total / pageSize);

        const filteredProfiles = studyProfiles.filter(
            (profile) => profile.targetlearning && profile.targetlearning.length > 0,
        );

        const result = filteredProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            return {
                ...profile,
                account,
                targetlearning: profile.targetlearning.slice(0, 1),
                startdate: profile.startdate
                    ? new Date(profile.startdate).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Saigon',
                      })
                    : null,
                enddate: profile.enddate
                    ? new Date(profile.enddate).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Saigon',
                      })
                    : null,
            };
        });

        return {
            data: result,
            totalPages,
            currentPage: page,
            totalItems: filteredProfiles.length,
        };
    }

    async updateStudyProfileStatus(accountId: string, status: StudyProfileStatus) {
        const studyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: accountId }, status: StudyProfileStatus.ACTIVE },
            order: { createdat: 'DESC' },
            relations: ['targetlearning'],
        });

        if (!studyProfile) {
            throw new NotFoundException('Active StudyProfile not found for this account');
        }

        studyProfile.status = status;

        const latestTargetLearning = await this.targetLearningRepository.findOne({
            where: { studyProfile: { id: studyProfile.id } },
            order: { createdat: 'DESC' },
        });

        if (!latestTargetLearning) {
            throw new NotFoundException('No TargetLearning found for this StudyProfile');
        }

        latestTargetLearning.status = TargetLearningStatus.COMPLETED;
        latestTargetLearning.startdate = new Date();
        latestTargetLearning.enddate = new Date();

        const updatedTargetLearning =
            await this.targetLearningRepository.save(latestTargetLearning);

        studyProfile.targetlearning = [updatedTargetLearning];

        return await this.studyProfileRepository.save(studyProfile);
    }

    async createStudyProfile(createStudyProfile: CreateStudyProfileDto) {
        const account = await this.accountRepository.findOne({
            where: { id: createStudyProfile.accountId },
        });

        if (!account) {
            throw new NotFoundException('Account is not found');
        }

        const create = await this.studyProfileRepository.create({
            account: { id: createStudyProfile.accountId },
            startdate: createStudyProfile.startDate,
            enddate: createStudyProfile.endDate,
            targetscoreMath: createStudyProfile.targetscoreMath,
            targetscoreRW: createStudyProfile.targetscoreRW,
            status: StudyProfileStatus.ACTIVE,
        });

        return await this.studyProfileRepository.save(create);
    }

    async getStudyProfileComplete(
        page: number,
        pageSize: number,
    ): Promise<any> {
        const skip = (page - 1) * pageSize;

        const [studyProfiles, total] = await this.studyProfileRepository
            .createQueryBuilder('studyProfile')
            .leftJoinAndSelect('studyProfile.account', 'account')
            .andWhere('studyProfile.status = :status', {
                status: StudyProfileStatus.COMPLETED,
            })
            .skip(skip)
            .take(pageSize)
            .getManyAndCount();

        const totalPages = Math.ceil(total / pageSize);


        const result = studyProfiles.map((profile) => {
            const account = plainToInstance(GetAccountDTO, profile.account, {
                excludeExtraneousValues: true,
            });

            return {
                ...profile,
                account,
                startdate: profile.startdate
                    ? new Date(profile.startdate).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Saigon',
                      })
                    : null,
                enddate: profile.enddate
                    ? new Date(profile.enddate).toLocaleDateString('vi-VN', {
                          timeZone: 'Asia/Saigon',
                      })
                    : null,
            };
        });

        return {
            data: result,
            totalPages,
            currentPage: page,
        };
    }
}
