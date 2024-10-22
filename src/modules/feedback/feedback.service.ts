import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { Feedback } from 'src/database/entities/feedback.entity';
import { PaginationService } from 'src/common/helpers/pagination.service';
import { PaginationOptionsDto } from 'src/common/dto/pagination-options.dto.ts';
import { BaseService } from '../base/base.service';
import { UnitService } from '../unit/unit.service';
import { UnitAreaService } from '../unit-area/unit-area.service';
import { LessonService } from '../lesson/lesson.service';
import { FeedbackDto, UnitFeedbackDto } from './dto/feedback.dto';
import { FeedbackStatus } from 'src/common/enums/feedback-status.enum';
import { UnitStatus } from 'src/common/enums/unit-status.enum';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly unitService: UnitService,
        private readonly unitAreaService: UnitAreaService,
        private readonly lessonService: LessonService,
    ) {
        super(feedbackRepository);
    }

    // async createFeedbackForUnit(createFeedbackDto: CreateFeedbackDto): Promise<Feedback> {
    //   const { unitId, accountId, content } = createFeedbackDto;

    //   const unit = await this.unitService.findOne(unitId);
    //   if (!unit) {
    //     throw new NotFoundException('Unit not found');
    //   }

    //   const feedback = this.feedbackRepository.save({
    //     unit: unit,
    //     accountId,
    //     content,
    //   });

    //   return this.feedbackRepository.save(feedback);
    // }

    async approveOrRejectLearningMaterial(
        feedbackDto: FeedbackDto,
        action: 'approve' | 'reject',
    ): Promise<void> {
        if (action === 'reject') {
            await this.handleReject(feedbackDto); // Call rejection handler
        } else if (action === 'approve') {
            await this.handleApprove(feedbackDto);
        }
    }

    private async handleReject(feedbackDto: FeedbackDto): Promise<void> {
        const { unitFeedback, unitAreasFeedback, lessonsFeedback } =
            feedbackDto;

        // Loop through each unit area and mark rejected ones as false
        for (const unitAreaFeedback of unitAreasFeedback) {
            const { unitAreaId, isApproved, content } = unitAreaFeedback;

            if (!isApproved) {
                // Mark unit area as rejected
                await this.unitAreaService.updateUnitAreaStatus(unitAreaId, {
                    status: false,
                });

                // Create feedback entry for rejected unit area
                await this.feedbackRepository.save({
                    unitArea: { id: unitAreaId },
                    content,
                    status: FeedbackStatus.REJECTED,
                });
            }
        }

        // Loop through each lesson and mark rejected ones as false
        for (const lessonFeedback of lessonsFeedback) {
            const { lessonId, isApproved, content } = lessonFeedback;

            if (!isApproved) {
                // Mark lesson as rejected
                await this.lessonService.updateLessonStatus(lessonId, {
                    status: false, // Set status to false for rejected parts
                });

                // Create feedback entry for rejected lesson
                await this.feedbackRepository.save({
                    lesson: { id: lessonId },
                    content,
                    status: FeedbackStatus.REJECTED,
                });
            }
        }

        await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            content: unitFeedback.content,
            status: FeedbackStatus.REJECTED,
        });

        await this.unitService.updateUnitStatus(unitFeedback.unitId, {
            status: UnitStatus.REJECTED,
        });
    }

    private async handleApprove(feedbackDto: FeedbackDto): Promise<void> {
        const { unitFeedback, unitAreasFeedback, lessonsFeedback } =
            feedbackDto;
        let anyRejected = false;

        // Ensure no rejected parts exist before approving
        for (const unitAreaFeedback of unitAreasFeedback) {
            if (!unitAreaFeedback.isApproved) {
                anyRejected = true;
            }
        }

        for (const lessonFeedback of lessonsFeedback) {
            if (!lessonFeedback.isApproved) {
                anyRejected = true;
            }
        }

        if (anyRejected) {
            throw new Error(
                'Cannot approve learning material with rejected parts',
            );
        }

        await this.feedbackRepository.save({
            unit: { id: unitFeedback.unitId },
            content: unitFeedback.content,
            status: FeedbackStatus.APPROVED,
        });

        // Mark unit as approved
        await this.unitService.updateUnitStatus(unitFeedback.unitId, {
            status: UnitStatus.APPROVED,
        });
    }
}
