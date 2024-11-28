import { BadRequestException, Injectable } from '@nestjs/common';
import { EvaluateFeedbackType } from 'src/common/enums/evaluate-feedback-type.enum';
import { CreateEvaluateFeedbackDto } from './dto/create-evaluate-feedback.dto';
import { EvaluateFeedback } from 'src/database/entities/evaluatefeedback.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EvaluateCriteria } from 'src/database/entities/evaluatecriteria.entity';
import { FeedbackCriteriaScores } from 'src/database/entities/feedbackcriteriascores.entity';
import { plainToClass } from 'class-transformer';
import { EvaluateFeedbackResponseDto } from './dto/evaluate-feedback-response.dto';
import { Account } from 'src/database/entities/account.entity';

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

    // Create feedback
    async createFeedback(
        createFeedbackDto: CreateEvaluateFeedbackDto,
    ): Promise<EvaluateFeedback> {
        const {
            accountFromId,
            accountToId,
            accountReviewId,
            narrativeFeedback,
            isEscalated,
            criteriaScores,
        } = createFeedbackDto;

        const evaluateFeedbackType = await this.generateEvaluateFeedbackType(
            accountFromId,
            accountToId,
        );
        
        // Create feedback instance
        const feedback = this.evaluateFeedbackRepository.create({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            accountReview: accountReviewId ? { id: accountReviewId } : null,
            narrativeFeedback,
            isEscalated,
            evaluateFeedbackType,
        });

        // Save feedback
        const savedFeedback = await this.evaluateFeedbackRepository.save(feedback);

        // Save criteria scores
        const scores = criteriaScores.map((scoreDto) => {
            return this.feedbackCriteriaScoresRepository.create({
                feedback: savedFeedback,
                criteria: { id: scoreDto.criteriaId },
                score: scoreDto.score,
            });
        });

        await this.feedbackCriteriaScoresRepository.save(scores);

        return savedFeedback;
    }

    private transfromData(
        evaluateFeedbacks: EvaluateFeedback[],
    ): EvaluateFeedbackResponseDto[] {
        return evaluateFeedbacks.map((feedback) =>
            plainToClass(EvaluateFeedbackResponseDto, {
                ...feedback,
                accountFrom: {
                    id: feedback.accountFrom.id,
                    username: feedback.accountFrom.username,
                    role: feedback.accountFrom.role,
                },
                accountTo: {
                    id: feedback.accountTo.id,
                    username: feedback.accountTo.username,
                    role: feedback.accountTo.role,
                },
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

    private async generateEvaluateFeedbackType(
        accountFromId: string,
        accountToId: string,
    ): Promise<EvaluateFeedbackType> {
        // Fetch accounts with roles
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

    async getEvaluateFeedbacks(
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

        return this.transfromData(feedbacks);
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

        return this.transfromData(feedbacks);
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

        return this.transfromData(feedbacks);
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

        return this.transfromData(feedbacks);
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

        return this.transfromData(feedbacks);
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

        return this.transfromData(feedbacks);
    }
}
