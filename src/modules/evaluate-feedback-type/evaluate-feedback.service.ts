import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';
import { CreateEvaluateFeedbackDto } from './dto/create-evaluate-feedback.dto';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackCriteriaScores } from 'src/database/entities/feedbackcriteriascores.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { EvaluateFeedbackResponseDto } from './dto/evaluate-feedback-response.dto';
import { Account } from 'src/database/entities/account.entity';
import { EvaluateFeedbackDetailResponseDto } from './dto/evaluate-feedback-detail-response.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';
import { CreateTeacherFeedbackDto } from './dto/create-teacher-feedback.dto';
import { NotificationService } from 'src/nofitication/notification.service';
import { FeedbackType } from 'src/common/enums/feedback-type.enum';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { StudyProfile } from 'src/database/entities/studyprofile.entity';
import { StudyProfileStatus } from 'src/common/enums/study-profile-status.enum';

@Injectable()
export class EvaluateFeedbackService {
    constructor(
        @InjectRepository(EvaluateFeedback)
        private readonly evaluateFeedbackRepository: Repository<EvaluateFeedback>,
        @InjectRepository(FeedbackCriteriaScores)
        private readonly feedbackCriteriaScoresRepository: Repository<FeedbackCriteriaScores>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        @InjectRepository(StudyProfile)
        private readonly studyProfileRepository: Repository<StudyProfile>,
        private readonly notificationService: NotificationService,
    ) {}

    async createEvaluateFeedback(
        createFeedbackDto: CreateEvaluateFeedbackDto,
    ): Promise<any> {

        const checkExist = await this.checkEvaluateFeedbackExist(createFeedbackDto.accountFromId )
        if (checkExist.IsExisted) {
            return 'You have already evaluated';
        }

        const studyProfileId = checkExist.StudyProfile.id;

        const {
            accountFromId,
            accountToId,
            narrativeFeedback,
            isEscalated,
            criteriaScores,
            isSendToStaff,
        } = createFeedbackDto;

        if (isSendToStaff) {
            await this.handleSendToStaffEvaluateFeedback(
                accountFromId,
                studyProfileId,
                narrativeFeedback,
                isEscalated,
                criteriaScores,
            );
            return 'Feedback sent to all staff success';
        }

        const evaluateFeedbackType = await this.generateEvaluateFeedbackType(
            accountFromId,
            accountToId,
        );

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            studyProfileid: studyProfileId ? { id: studyProfileId } : null,
            narrativeFeedback,
            isEscalated,
            evaluateFeedbackType,
        });

        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        if (criteriaScores) {
            const scores = this.mapCriteriaScores(criteriaScores, savedFeedback);
            await this.feedbackCriteriaScoresRepository.save(scores);
        }

        const notificationMessage = 'New evaluate was sent';

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendNotification(
            accountToId,
            accountFromId,
            savedFeedback,
            notificationMessage,
            FeedbackType.EVALUATE,
            FeedbackEventType.SEND_EVALUATE,
        );

        return savedFeedback;
    }

    private async checkEvaluateFeedbackExist(
        accountFromId: string,
    ): Promise<{ IsExisted: boolean; StudyProfile: StudyProfile }> {
        const currentStudyProfile = await this.studyProfileRepository.findOne({
            where: { account: { id: accountFromId }, status: StudyProfileStatus.ACTIVE },
        });

        if (!currentStudyProfile) {
            return { IsExisted: false, StudyProfile: null };
        }

        const lastEvaluateStudyProfile = await this.evaluateFeedbackRepository.findOne({
            where: {
                accountFrom: { id: accountFromId },
                studyProfileid: { id: currentStudyProfile.id },
            },
        });

        if (lastEvaluateStudyProfile) {
            return { IsExisted: true, StudyProfile: currentStudyProfile };
        }
        return { IsExisted: false, StudyProfile: currentStudyProfile };
    }

    async createFeedback(createFeedbackDto: CreateFeedbackDto): Promise<any> {
        const { accountFromId, reason, narrativeFeedback, isSendToStaff } =
            createFeedbackDto;

        if (isSendToStaff) {
            await this.handleSendToStaffFeedback(
                accountFromId,
                reason,
                narrativeFeedback,
            );
            return 'Feedback sent to all staff success';
        }

        await this.handleSendToManagerFeedback(accountFromId, reason, narrativeFeedback);
        return 'Feedback sent to all manager success';
    }

    async createTeacherFeedback(
        createFeedbackDto: CreateTeacherFeedbackDto,
    ): Promise<any> {
        const { accountFromId, accountToId, reason, narrativeFeedback } =
            createFeedbackDto;

        await this.handleSendToTeacherFeedback(
            accountFromId,
            accountToId,
            reason,
            narrativeFeedback,
        );
        return 'Feedback sent to teahcer success';
    }

    private async handleSendToStaffEvaluateFeedback(
        accountFromId: string,
        studyProfileId: string | null,
        narrativeFeedback: string,
        isEscalated: boolean,
        criteriaScores: { criteriaId: string; score: number }[],
    ): Promise<void> {
        const accountFrom = await this.accountRepository.findOne({
            where: { id: accountFromId },
            select: ['id', 'role'],
            relations: ['role'],
        });

        if (!accountFrom) {
            throw new Error('AccountFrom not found.');
        }

        const feedbackType =
            accountFrom.role.rolename === 'Teacher'
                ? EvaluateFeedbackType.TEACHER_TO_STAFF
                : EvaluateFeedbackType.STUDENT_TO_STAFF;

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            studyProfileid: studyProfileId ? { id: studyProfileId } : null,
            narrativeFeedback,
            isEscalated,
            evaluateFeedbackType: feedbackType,
        });

        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        if (criteriaScores) {
            const scores = this.mapCriteriaScores(criteriaScores, savedFeedback);
            await this.feedbackCriteriaScoresRepository.save(scores);
        }
    }

    private async handleSendToStaffFeedback(
        accountFromId: string,
        reason: string,
        narrativeFeedback: string,
    ): Promise<void> {
        const accountFrom = await this.accountRepository.findOne({
            where: { id: accountFromId },
            select: ['id', 'role'],
            relations: ['role'],
        });

        if (!accountFrom) {
            throw new Error('AccountFrom not found.');
        }

        const feedbackType =
            accountFrom.role.rolename === 'Teacher'
                ? EvaluateFeedbackType.TEACHER_TO_STAFF
                : EvaluateFeedbackType.STUDENT_TO_STAFF;

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            reason: reason,
            narrativeFeedback: narrativeFeedback,
            evaluateFeedbackType: feedbackType,
        });

        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        const notificationMessage = 'New feedback was sent';

        const managers = await this.accountRepository.find({
            where: { role: { rolename: 'Staff' } },
        });

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFrom.id,
            savedFeedback,
            notificationMessage,
            FeedbackType.FEEDBACK,
            FeedbackEventType.SEND_FEEDBACK,
        );
    }

    private async handleSendToManagerFeedback(
        accountFromId: string,
        reason: string,
        narrativeFeedback: string,
    ): Promise<void> {
        const feedbackType = EvaluateFeedbackType.STAFF_TO_MANAGER;

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            reason: reason,
            narrativeFeedback: narrativeFeedback,
            evaluateFeedbackType: feedbackType,
        });

        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        const notificationMessage = 'New feedback was sent';

        const managers = await this.accountRepository.find({
            where: { role: { rolename: 'Manager' } },
        });

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFromId,
            savedFeedback,
            notificationMessage,
            FeedbackType.FEEDBACK,
            FeedbackEventType.SEND_FEEDBACK,
        );
    }

    private async handleSendToTeacherFeedback(
        accountFromId: string,
        accountToId: string,
        reason: string,
        narrativeFeedback: string,
    ): Promise<void> {
        const feedbackType = EvaluateFeedbackType.STUDENT_TO_TEACHER;

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            reason: reason,
            narrativeFeedback: narrativeFeedback,
            evaluateFeedbackType: feedbackType,
        });

        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        const notificationMessage = 'New feedback was sent';

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendNotification(
            accountToId,
            accountFromId,
            savedFeedback,
            notificationMessage,
            FeedbackType.FEEDBACK,
            FeedbackEventType.SEND_FEEDBACK,
        );
    }

    private mapCriteriaScores(
        criteriaScores: { criteriaId: string; score: number }[],
        feedback: EvaluateFeedback,
    ): any[] {
        return criteriaScores.map((scoreDto) =>
            this.feedbackCriteriaScoresRepository.create({
                feedback,
                criteria: { id: scoreDto.criteriaId },
                score: scoreDto.score,
            }),
        );
    }

    private transfromListData(
        evaluateFeedbacks: EvaluateFeedback[],
    ): EvaluateFeedbackResponseDto[] {
        return evaluateFeedbacks.map((feedback) =>
            plainToClass(EvaluateFeedbackResponseDto, {
                ...feedback,
                accountFrom: {
                    id: feedback.accountFrom.id,
                    username: feedback.accountFrom.username,
                    role: feedback.accountFrom.role,
                    profileImage: feedback.accountFrom.profilepictureurl,
                },
                accountTo: feedback.accountTo
                    ? {
                          id: feedback.accountTo.id,
                          username: feedback.accountTo.username,
                          role: feedback.accountTo.role,
                          profileImage: feedback.accountTo.profilepictureurl,
                      }
                    : null,
            }),
        );
    }

    private async generateEvaluateFeedbackType(
        accountFromId: string,
        accountToId: string,
    ): Promise<EvaluateFeedbackType> {
        const accountFrom = await this.accountRepository.findOne({
            where: { id: accountFromId },
            select: ['id', 'role'],
            relations: ['role'],
        });

        if (!accountFrom) {
            throw new BadRequestException('Account from not found');
        }

        const accountTo = await this.accountRepository.findOne({
            where: { id: accountToId },
            select: ['id', 'role'],
            relations: ['role'],
        });

        if (!accountTo) {
            throw new BadRequestException('Account to not found');
        }

        if (accountFrom.role.rolename === 'Student') {
            if (accountTo.role.rolename === 'Teacher') {
                return EvaluateFeedbackType.STUDENT_TO_TEACHER;
            } else if (accountTo.role.rolename === 'Staff') {
                return EvaluateFeedbackType.STUDENT_TO_STAFF;
            }
        } else if (accountFrom.role.rolename === 'Teacher') {
            if (accountTo.role.rolename === 'Student') {
                return EvaluateFeedbackType.TEACHER_TO_STUDENT;
            } else if (accountTo.role.rolename === 'Staff') {
                return EvaluateFeedbackType.TEACHER_TO_STAFF;
            }
        }
        // else if (
        //     accountFrom.role.rolename === 'Staff' &&
        //     accountTo.role.rolename === 'Teacher'
        // ) {
        //     return EvaluateFeedbackType.STAFF_TO_TEACHER;
        // }

        throw new BadRequestException('Invalid role mapping for feedback type');
    }

    async getReceivedEvaluateFeedbacks(
        accountId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: { accountTo: { id: accountId } },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getSentEvaluateFeedbacks(
        accountId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: { accountFrom: { id: accountId } },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForTeacherToStudent(
        teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: teacherId },
                evaluateFeedbackType: EvaluateFeedbackType.TEACHER_TO_STUDENT,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForTeacherToStaffAboutStudent(
        teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: teacherId },
                evaluateFeedbackType: EvaluateFeedbackType.TEACHER_TO_STAFF,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForTeacherSent(
        teacherId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: teacherId },
                evaluateFeedbackType:
                    EvaluateFeedbackType.TEACHER_TO_STAFF ||
                    EvaluateFeedbackType.TEACHER_TO_STUDENT,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForStudentToTeacher(
        studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: studentId },
                evaluateFeedbackType: EvaluateFeedbackType.STUDENT_TO_TEACHER,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForStudentToStaffAboutTeacher(
        studentId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: studentId },
                evaluateFeedbackType: EvaluateFeedbackType.STUDENT_TO_STAFF,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    // async getFeedbacksForStaffToTeacher(
    //     staffId: string,
    // ): Promise<EvaluateFeedbackResponseDto[]> {
    //     const feedbacks = await this.evaluateFeedbackRepository.find({
    //         where: {
    //             accountFrom: { id: staffId },
    //             evaluateFeedbackType: EvaluateFeedbackType.STAFF_TO_TEACHER,
    //         },
    //         relations: [
    //             'accountFrom',
    //             'accountTo',
    //             'criteriaScores',
    //             'criteriaScores.criteria',
    //         ],
    //         order: { createdat: 'DESC' },
    //     });

    //     return this.transfromListData(feedbacks);
    // }

    async getStudyProfileIdsByAccountFrom(
        accountFromId: string,
    ): Promise<{ studyProfileId: string }[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: { accountFrom: { id: accountFromId } },
            relations: ['studyProfileid'],
        });

        const uniqueStudyProfileIds = Array.from(
            new Set(feedbacks.map((feedback) => feedback.studyProfileid?.id)),
        ).filter((id): id is string => id !== undefined);

        return uniqueStudyProfileIds.map((studyProfileId) => ({ studyProfileId }));
    }

    async getFeedbackDetail(
        feedbackId: string,
    ): Promise<EvaluateFeedbackDetailResponseDto> {
        const feedback = await this.evaluateFeedbackRepository.findOne({
            where: {
                id: feedbackId,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        if (!feedback) {
            throw new NotFoundException(`Feedback with ID ${feedbackId} not found`);
        }

        // Transform and sort `criteriaScores`
        const sortedCriteriaScores = feedback.criteriaScores
            .map((score) => ({
                name: score.criteria.name,
                description: score.criteria.description,
                score: score.score,
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Inject sorted criteriaScores into DTO
        const feedbackDto = plainToInstance(EvaluateFeedbackDetailResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
        feedbackDto.criteriaScores = sortedCriteriaScores;

        return feedbackDto;
    }

    async getStaffReceivedEvaluateFeedbacks(): Promise<FeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                evaluateFeedbackType: In([
                    EvaluateFeedbackType.TEACHER_TO_STAFF,
                    EvaluateFeedbackType.STUDENT_TO_STAFF,
                ]),
            },
            relations: [
                'accountFrom',
                'criteriaScores',
                'criteriaScores.criteria',
                'studyProfileid',
            ],
            order: { createdat: 'DESC' },
        });

        return Promise.all(
            feedbacks.map(async (feedback) => {
                const feedbackDto = plainToInstance(
                    FeedbackResponseDto,
                    {
                        ...feedback,
                        accountFrom: feedback.accountFrom
                            ? {
                                  id: feedback.accountFrom.id,
                                  username: feedback.accountFrom.username,
                                  firstname: feedback.accountFrom.firstname,
                                  lastname: feedback.accountFrom.lastname,
                                  profileImage: feedback.accountFrom.profilepictureurl,
                              }
                            : null,
                    },
                    { excludeExtraneousValues: true },
                );

                // Map `criteriaScores` to desired format
                const criteriaScores =
                    feedback.criteriaScores?.map((score) => ({
                        id: score.criteria.id,
                        name: score.criteria.name,
                        description: score.criteria.description,
                        score: score.score,
                    })) || [];

                // Fetch teacher information if `studyProfileid` exists
                let teacherInfo = null;
                if (feedback.studyProfileid?.teacherId) {
                    const teacher = await this.accountRepository.findOne({
                        where: { id: feedback.studyProfileid.teacherId },
                        select: [
                            'id',
                            'firstname',
                            'lastname',
                            'username',
                            'email',
                            'profilepictureurl',
                        ],
                    });

                    if (teacher) {
                        teacherInfo = {
                            id: teacher.id,
                            firstname: teacher.firstname,
                            lastname: teacher.lastname,
                            username: teacher.username,
                            email: teacher.email,
                            profilePicture: teacher.profilepictureurl,
                        };
                    }
                }

                // Append new data to the DTO
                return {
                    ...feedbackDto,
                    criteriaScores,
                    teacherInfo,
                };
            }),
        );
    }

    async getManagerReceivedEvaluateFeedbacks(): Promise<FeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                evaluateFeedbackType: EvaluateFeedbackType.STAFF_TO_MANAGER,
            },
            relations: ['accountFrom'],
            order: { createdat: 'DESC' },
        });

        return feedbacks.map((feedback) => {
            // Manually map `accountFrom` into the `AccountDto` format
            const feedbackDto = plainToInstance(
                FeedbackResponseDto,
                {
                    ...feedback,
                    accountFrom: feedback.accountFrom
                        ? {
                              id: feedback.accountFrom.id,
                              username: feedback.accountFrom.username,
                              firstname: feedback.accountFrom.firstname,
                              lastname: feedback.accountFrom.lastname,
                              profileImage: feedback.accountFrom.profilepictureurl,
                          }
                        : null,
                },
                { excludeExtraneousValues: true },
            );

            return feedbackDto;
        });
    }
}
