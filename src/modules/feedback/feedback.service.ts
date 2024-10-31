import {
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from 'src/database/entities/feedback.entity';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { LearningMaterialFeedbackDto } from './dto/learning-material-feedback.dto';
import { CreateFeedbackUnitDto } from './dto/create-feedback-unit.dto';
import { AccountService } from '../account/account.service';
import { FeedbacksGateway } from '../nofitication/feedback.gateway';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { QuestionFeedbackDto } from './dto/question-feedback.dto';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { FeedbackReason } from 'src/common/enums/feedback-reason.enum';
import { QuestionFeedbackResponseDto } from './dto/get-question-feedback.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly lessonService: LessonService,
        private readonly feedbackGateway: FeedbacksGateway,
        private readonly accountService: AccountService,
    ) {
        super(feedbackRepository);
    }

    //For consistency and better error handling, it’s good to wrap feedback creation and status updates inside a try-catch block and possibly use Promise.all to parallelize lesson feedback updates.
    async rejectLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        const feedbackPromises = unitFeedback.lessonsFeedback.map(
            async (lessonFeedback) => {
                const { lessonId, isRejected, content, reason } =
                    lessonFeedback;

                if (isRejected) {
                    await this.lessonService.updateLessonStatus(lessonId, {
                        status: false,
                    });

                    await this.feedbackRepository.save({
                        accountFrom: { id: accountFromId },
                        accountTo: { id: accountToId },
                        lesson: { id: lessonId },
                        unit: { id: unitFeedback.unitId },
                        content,
                        reason,
                        status: FeedbackStatus.REJECTED,
                    });
                }
            },
        );

        await Promise.all(feedbackPromises);

        // Create feedback entry for the unit
        const rejectFeedback = await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            content: 'Rejected due to lesson issues',
            status: FeedbackStatus.REJECTED,
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Learning material was rejected`,
            FeedbackEventType.UNIT_FEEDBACK,
        );

        return rejectFeedback;
    }

    async approveLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        // Approve all lessons by setting their status to true
        for (const lessonFeedback of unitFeedback.lessonsFeedback) {
            // Update each lesson's status to true
            await this.lessonService.updateLessonStatus(
                lessonFeedback.lessonId,
                {
                    status: true, // Set status to true for approved lessons
                },
            );
        }

        // Create feedback entry for the approved unit
        const approvedFeedback = await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content: 'Approved',
            status: FeedbackStatus.APPROVED,
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Learning material was approved`,
            FeedbackEventType.UNIT_FEEDBACK,
        );

        return approvedFeedback;
    }

    async submitLearningMaterial(
        createFeedbackDto: CreateFeedbackUnitDto,
    ): Promise<
        { feedbackId: string; accountFrom: string; accountTo: string }[]
    > {
        const feedbackList: {
            feedbackId: string;
            accountFrom: string;
            accountTo: string;
        }[] = [];

        //Notify managers when feedback is submitted
        const managers = await this.accountService.findManagers();

        const accountFrom = await this.accountService.findOneById(
            createFeedbackDto.accountFromId,
        );

        if (accountFrom === null) {
            throw new NotFoundException('Account not found');
        }

        const feedbackPromises = managers.map(async (manager) => {
            createFeedbackDto.accountFrom = accountFrom;
            createFeedbackDto.accountTo = manager;
            const feedback = this.feedbackRepository.create(createFeedbackDto);
            this.feedbackRepository.save(feedback);

            // Store feedback details in the list
            feedbackList.push({
                feedbackId: feedback.id,
                accountFrom: feedback.accountFrom.id,
                accountTo: feedback.accountTo.id,
            });
        });

        await Promise.all(feedbackPromises);

        this.feedbackGateway.sendNotificationToMultipleUsers(
            managers.map((manager) => manager.id),
            `New learning material was submitted`,
            FeedbackEventType.UNIT_FEEDBACK,
        );

        return feedbackList;
    }

    async rejectQuestionFeedback(
        feedbackDto: QuestionFeedbackDto,
    ): Promise<Feedback> {
        const { questionId, content, reason, accountFromId, accountToId } =
            feedbackDto;

        const rejectFeedback = await this.feedbackRepository.save({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            reason,
            status: FeedbackStatus.REJECTED,
            question: { id: questionId },
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Question was rejected`,
            FeedbackEventType.QUESTION_FEEDBACK,
        );

        return rejectFeedback;
    }

    async approveQuestionFeedback(
        feedbackDto: QuestionFeedbackDto,
    ): Promise<Feedback> {
        const { questionId, content, accountFromId, accountToId } = feedbackDto;

        const approvedFeedback = await this.feedbackRepository.save({
            question: { id: questionId },
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            status: FeedbackStatus.APPROVED,
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Question was approved`,
            FeedbackEventType.QUESTION_FEEDBACK,
        );

        return approvedFeedback;
    }

    async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
        return this.feedbackRepository.find({
            where: [{ accountTo: { id: userId } }],
            relations: ['unit', 'exam', 'question'],
            order: { createdat: 'DESC' },
        });
    }

    async getQuestionFeedbackUserId(userId: string, questionId: string): Promise<QuestionFeedbackResponseDto> {
        const feedback = await this.feedbackRepository.findOne({
            where: [{ accountTo: { id: userId }, question: { id: questionId } }],
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }
    
        // Transform the entity to DTO
        return plainToInstance(QuestionFeedbackResponseDto, feedback, { excludeExtraneousValues: true });
    }

    async getLessonFeedbackUserId(userId: string, questionId: string): Promise<QuestionFeedbackResponseDto> {
        const feedback = await this.feedbackRepository.findOne({
            where: [{ accountTo: { id: userId }, question: { id: questionId } }],
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }
    
        // Transform the entity to DTO
        return plainToInstance(QuestionFeedbackResponseDto, feedback, { excludeExtraneousValues: true });
    }
}
