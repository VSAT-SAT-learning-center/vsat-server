import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';
import { CreateEvaluateFeedbackDto } from './dto/create-evaluate-feedback.dto';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackCriteriaScores } from 'src/database/entities/feedbackcriteriascores.entity';
import { plainToClass, plainToInstance } from 'class-transformer';
import { EvaluateFeedbackResponseDto } from './dto/evaluate-feedback-response.dto';
import { Account } from 'src/database/entities/account.entity';
import { EvaluateFeedbackDetailResponseDto } from './dto/evaluate-feedback-detail-response.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackResponseDto } from './dto/feedback-response.dto';

@Injectable()
export class EvaluateFeedbackService {
    constructor(
        @InjectRepository(EvaluateFeedback)
        private readonly evaluateFeedbackRepository: Repository<EvaluateFeedback>,
        @InjectRepository(FeedbackCriteriaScores)
        private readonly feedbackCriteriaScoresRepository: Repository<FeedbackCriteriaScores>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}

    async createEvaluateFeedback(
        createFeedbackDto: CreateEvaluateFeedbackDto,
    ): Promise<any> {
        const {
            accountFromId,
            accountToId,
            accountReviewId,
            studyProfileId,
            narrativeFeedback,
            isEscalated,
            criteriaScores,
            isSendToStaff,
        } = createFeedbackDto;

        if (isSendToStaff) {
            await this.handleSendToStaffEvaluateFeedback(
                accountFromId,
                accountReviewId,
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
            accountReview: accountReviewId ? { id: accountReviewId } : null,
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
        return savedFeedback;
    }

    async createFeedbackd(createFeedbackDto: CreateFeedbackDto): Promise<any> {
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

    private async handleSendToStaffEvaluateFeedback(
        accountFromId: string,
        accountReviewId: string | null,
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

        const staffAccounts = await this.accountRepository.find({
            where: { role: { rolename: 'Staff' } },
            select: ['id', 'role'],
            relations: ['role'],
        });

        const feedbackType =
            accountFrom.role.rolename === 'Teacher'
                ? EvaluateFeedbackType.TEACHER_TO_STAFF
                : EvaluateFeedbackType.STUDENT_TO_STAFF;

        for (const staff of staffAccounts) {
            const feedback = this.evaluateFeedbackRepository.create({
                accountFrom: { id: accountFromId },
                accountTo: { id: staff.id },
                accountReview: accountReviewId ? { id: accountReviewId } : null,
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

        await this.evaluateFeedbackRepository.save(feedback);
    }

    private async handleSendToManagerFeedback(
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

        const feedbackType = EvaluateFeedbackType.STAFF_TO_MANAGER;

        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            reason: reason,
            narrativeFeedback: narrativeFeedback,
            evaluateFeedbackType: feedbackType,
        });

        await this.evaluateFeedbackRepository.save(feedback);
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
                accountReview: feedback.accountReview
                    ? {
                          id: feedback.accountReview.id,
                          username: feedback.accountReview.username,
                          role: feedback.accountReview.role,
                      }
                    : null,
            }),
        );
    }

    private transformFeedListData(
        evaluateFeedbacks: EvaluateFeedback[],
    ): EvaluateFeedbackResponseDto[] {
        return evaluateFeedbacks.map((feedback) =>
            plainToInstance(
                EvaluateFeedbackResponseDto,
                {
                    id: feedback.id,
                    createdAt: feedback.createdat,
                    updatedAt: feedback.updatedat,
                    narrativeFeedback: feedback.narrativeFeedback,
                    reason: feedback.reason,
                    evaluateFeedbackType: feedback.evaluateFeedbackType,
                    accountFrom: {
                        id: feedback.accountFrom.id,
                        username: feedback.accountFrom.username,
                        role: feedback.accountFrom.role,
                        profileImage: feedback.accountFrom.profilepictureurl,
                    },
                    accountTo: {
                        id: feedback.accountTo.id,
                        username: feedback.accountTo.username,
                        role: feedback.accountTo.role,
                        profileImage: feedback.accountTo.profilepictureurl,
                    },
                },
                { excludeExtraneousValues: true },
            ),
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
        } else if (
            accountFrom.role.rolename === 'Staff' &&
            accountTo.role.rolename === 'Teacher'
        ) {
            return EvaluateFeedbackType.STAFF_TO_TEACHER;
        }

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
                'accountReview',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getSendedEvaluateFeedbacks(
        accountId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: { accountFrom: { id: accountId } },
            relations: [
                'accountFrom',
                'accountTo',
                'accountReview',
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
                'accountReview',
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
                'accountReview',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForTeacherSended(
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
                'accountReview',
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
                'accountReview',
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
                'accountReview',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getFeedbacksForStaffToTeacher(
        staffId: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                accountFrom: { id: staffId },
                evaluateFeedbackType: EvaluateFeedbackType.STAFF_TO_TEACHER,
            },
            relations: [
                'accountFrom',
                'accountTo',
                'accountReview',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

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
                'accountReview',
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

    async getReceivedEvaluateFeedbacksByRole(
        accountId: string,
        role: string,
    ): Promise<EvaluateFeedbackResponseDto[]> {
        let where;
        if (role === 'Staff') {
            where = {
                evaluateFeedbackType:
                    EvaluateFeedbackType.TEACHER_TO_STAFF ||
                    EvaluateFeedbackType.STUDENT_TO_STAFF,
            };
        } else if (role === 'Manager') {
            where = {
                evaluateFeedbackType: EvaluateFeedbackType.STAFF_TO_MANAGER,
            };
        }
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where,
            relations: [
                'accountFrom',
                'accountTo',
                'accountReview',
                'criteriaScores',
                'criteriaScores.criteria',
            ],
            order: { createdat: 'DESC' },
        });

        return this.transfromListData(feedbacks);
    }

    async getStaffReceivedEvaluateFeedbacks(): Promise<FeedbackResponseDto[]> {
        const feedbacks = await this.evaluateFeedbackRepository.find({
            where: {
                evaluateFeedbackType:
                    EvaluateFeedbackType.TEACHER_TO_STAFF ||
                    EvaluateFeedbackType.STUDENT_TO_STAFF,
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
                              profilePicture: feedback.accountFrom.profilepictureurl,
                          }
                        : null,
                },
                { excludeExtraneousValues: true },
            );
    
            return feedbackDto;
        });
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
                              profilePicture: feedback.accountFrom.profilepictureurl,
                          }
                        : null,
                },
                { excludeExtraneousValues: true },
            );
    
            return feedbackDto;
        });
    }
}
