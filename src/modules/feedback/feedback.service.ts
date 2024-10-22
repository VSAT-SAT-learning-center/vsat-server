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
import { FeedbackDto, UnitFeedbackDto } from './dto/get-feedback.dto';
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

    async approveOrRejectLearningMaterial(
        feedbackDto: FeedbackDto,
        action: 'approve' | 'reject',
      ): Promise<void> {
        if (action === 'reject') {
          await this.handleReject(feedbackDto);
        } else if (action === 'approve') {
          await this.handleApprove(feedbackDto);
        }
      }
      
      private async handleReject(feedbackDto: FeedbackDto): Promise<void> {
        const { unitFeedback } = feedbackDto;
      
        // Loop through each unit area and lessons inside the unit
        for (const unitAreaFeedback of unitFeedback.unitAreasFeedback) {
          for (const lessonFeedback of unitAreaFeedback.lessonsFeedback) {
            const { lessonId, isRejected, content, reason } = lessonFeedback;
      
            if (isRejected) {
              // Mark lesson as rejected
              await this.lessonService.updateLessonStatus(lessonId, {
                status: false, // Set status to false for rejected lessons
              });
      
              // Create feedback entry for rejected lesson
              await this.feedbackRepository.save({
                lesson: { id: lessonId },
                content,
                reason,
                status: FeedbackStatus.REJECTED,
              });
            }
          }
        }
      
        // Create feedback entry for the unit
        await this.feedbackRepository.save({
          unit: { id: unitFeedback.unitId },
          content: 'Rejected due to lesson or unit area issues',
          status: FeedbackStatus.REJECTED,
        });
      
        // Mark the entire unit as rejected
        await this.unitService.updateUnitStatus(unitFeedback.unitId, {
          status: UnitStatus.REJECTED,
        });
      }
      
      private async handleApprove(feedbackDto: FeedbackDto): Promise<void> {
        const { unitFeedback } = feedbackDto;
        let anyRejected = false;
      
        // Loop through unit areas and lessons to ensure nothing is rejected
        for (const unitAreaFeedback of unitFeedback.unitAreasFeedback) {
          for (const lessonFeedback of unitAreaFeedback.lessonsFeedback) {
            if (lessonFeedback.isRejected) {
              anyRejected = true;
            }
          }
        }
      
        // If any lesson or unit area is rejected, throw an error
        if (anyRejected) {
          throw new Error(
            'Cannot approve learning material with rejected parts',
          );
        }
      
        // Approve all lessons by setting their status to true
        for (const unitAreaFeedback of unitFeedback.unitAreasFeedback) {
          for (const lessonFeedback of unitAreaFeedback.lessonsFeedback) {
            // Update each lesson's status to true
            await this.lessonService.updateLessonStatus(lessonFeedback.lessonId, {
              status: true, // Set status to true for approved lessons
            });
          }
        }
      
        // Create feedback entry for the approved unit
        await this.feedbackRepository.save({
          unit: { id: unitFeedback.unitId },
          content: 'Approved',
          status: FeedbackStatus.APPROVED,
        });
      
        // Mark the entire unit as approved
        await this.unitService.updateUnitStatus(unitFeedback.unitId, {
          status: UnitStatus.APPROVED,
        });
      }
      
}
