import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { Feedback } from 'src/database/entities/feedback.entity';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { FeedbacksGateway } from '../nofitication/feedback.gateway';
import { CreateFeedbackUnitDto } from './dto/create-feedback-unit.dto';
import { LearningMaterialFeedbackDto } from './dto/learning-material-feedback.dto';
import { QuestionFeedbackDto } from './dto/question-feedback.dto';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly lessonService: LessonService,
        private readonly feeddbacksGateway: FeedbacksGateway,
        private readonly accountService: AccountService,
    ) {
        super(feedbackRepository);
    }

    async rejectLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        // Loop through each unit area and lessons inside the unit

        for (const lessonFeedback of unitFeedback.lessonsFeedback) {
            const { lessonId, isRejected, content, reason } = lessonFeedback;

            if (isRejected) {
                // Mark lesson as rejected
                await this.lessonService.updateLessonStatus(lessonId, {
                    status: false, // Set status to false for rejected lessons
                });

                // Create feedback entry for rejected lesson
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
        }

        // Create feedback entry for the unit
        return await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            content: 'Rejected due to lesson issues',
            status: FeedbackStatus.REJECTED,
        });
    }

    async approveLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback } = feedbackDto;

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
        return await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            content: 'Approved',
            status: FeedbackStatus.APPROVED,
        });
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

        managers.forEach((manager) => {
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

            console.log('sending notification to manager: ', manager.firstname);
            this.feeddbacksGateway.sendNotificationToUser(
                manager.id,
                `New learning material was submitted`,
                FeedbackEventType.UNIT_FEEDBACK,
            );
        });

        return feedbackList;
    }

    async rejectQuestionFeedback(
        feedbackDto: QuestionFeedbackDto,
    ): Promise<Feedback> {
        const { questionId, content, reason, accountFromId, accountToId } =
            feedbackDto;

        return await this.feedbackRepository.save({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            reason,
            status: FeedbackStatus.REJECTED,
            question: { id: questionId },
        });
    }

    async approveQuestionFeedback(
        feedbackDto: QuestionFeedbackDto,
    ): Promise<void> {
        const { questionId, content } = feedbackDto;

        await this.feedbackRepository.save({
            question: { id: questionId },
            content,
            status: FeedbackStatus.APPROVED,
        });
    }

    async markAsRead(feedbackId: string): Promise<Feedback> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
        });

        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }

        feedback.isRead = true;

        return this.feedbackRepository.save(feedback);
    }

    async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
        return this.feedbackRepository.find({
            where: [{ accountTo: { id: userId } }],
            relations: ['unit', 'exam', 'question'],
            order: { createdat: 'DESC' },
        });
    }
}
