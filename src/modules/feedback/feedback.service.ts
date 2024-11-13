import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
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
import { QuestionFeedbackResponseDto } from './dto/get-question-feedback.dto';
import { plainToClass, plainToInstance } from 'class-transformer';
import { QuizQuestionFeedbackDto } from './dto/quizquestion-feedback.dto';
import { ExamCensorFeedbackDto } from './dto/exam-feedback.dto';
import { ModuleTypeService } from '../module-type/module-type.service';
import { ExamFeedbackResponseDto } from './dto/get-exam-feedback.dto';
import { UnitFeedbackResponseDto } from './dto/get-unit-feedback.dto';
import { LessonDto, UnitFeedbackWithLessonResponseDto } from './dto/get-unit-feedback-with-lesson.dto';
import { ExamDto, FeedbackDetailResponseDto, QuestionDto, UnitDto } from './dto/get-feedback-details.dto';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        private readonly lessonService: LessonService,
        private readonly feedbackGateway: FeedbacksGateway,
        private readonly accountService: AccountService,
        private readonly moduleTypeService: ModuleTypeService,
    ) {
        super(feedbackRepository);
    }

    async getFeedbackDetails(feedbackId: string): Promise<FeedbackDetailResponseDto> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
            relations: ['unit', 'lesson', 'exam', 'question', 'quizquestion', 'accountFrom', 'accountTo'],
        });
    
        if (!feedback) {
            throw new NotFoundException('Feedback not found');
        }
    
        // Transform feedback entity to the response DTO
        return plainToClass(FeedbackDetailResponseDto, {
            id: feedback.id,
            createdat: feedback.createdat,
            updatedat: feedback.updatedat,
            content: feedback.content,
            reason: feedback.reason,
            lesson: feedback.lesson,
            unit: feedback.unit,
            exam: feedback.exam,
            question: feedback.question,
            accountFrom: feedback.accountFrom,
            accountTo: feedback.accountTo,
        });
    }

    //For consistency and better error handling, it’s good to wrap feedback creation and status updates inside a try-catch block
    //and possibly use Promise.all to parallelize lesson feedback updates.
    async rejectLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        const feedbackPromises = unitFeedback.lessonsFeedback.map(
            async (lessonFeedback) => {
                const { lessonId, isRejected, content, reason } = lessonFeedback;

                if (isRejected) {
                    await this.lessonService.updateLessonStatus(lessonId, false);

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
                true, // Set status to true for approved lessons
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
    ): Promise<{ feedbackId: string; accountFrom: string; accountTo: string }[]> {
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

    async rejectQuestionFeedback(feedbackDto: QuestionFeedbackDto): Promise<Feedback> {
        const { questionId, content, reason, accountFromId, accountToId } = feedbackDto;

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

    async approveQuestionFeedback(feedbackDto: QuestionFeedbackDto): Promise<Feedback> {
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

    async rejectQuizQuestionFeedback(
        feedbackDto: QuizQuestionFeedbackDto,
    ): Promise<Feedback> {
        const { quizQuestionId, content, reason, accountFromId, accountToId } =
            feedbackDto;

        const rejectFeedback = await this.feedbackRepository.save({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            reason,
            status: FeedbackStatus.REJECTED,
            quizQuestion: { id: quizQuestionId },
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Question was rejected`,
            FeedbackEventType.QUESTION_FEEDBACK,
        );

        return rejectFeedback;
    }

    async approveQuizQuestionFeedback(
        feedbackDto: QuizQuestionFeedbackDto,
    ): Promise<Feedback> {
        const { quizQuestionId, content, accountFromId, accountToId } = feedbackDto;

        const approvedFeedback = await this.feedbackRepository.save({
            quizQuestion: { id: quizQuestionId },
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

    async rejectExamFeedback(feedbackDto: ExamCensorFeedbackDto): Promise<Feedback> {
        const { examFeedback, accountFromId, accountToId } = feedbackDto;

        const feedbackPromises = examFeedback.moduleTypesFeedback.map(
            async (moduleTypesFeedback) => {
                const { moduleTypeId, isRejected, content, reason } = moduleTypesFeedback;

                if (isRejected) {
                    await this.moduleTypeService.updateModuleTypestatus(
                        moduleTypeId,
                        false,
                    );

                    await this.feedbackRepository.save({
                        accountFrom: { id: accountFromId },
                        accountTo: { id: accountToId },
                        moduletype: { id: moduleTypeId },
                        exam: { id: examFeedback.examId },
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
            exam: { id: examFeedback.examId },
            content: 'Rejected due to module issues',
            status: FeedbackStatus.REJECTED,
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Exam was rejected`,
            FeedbackEventType.EXAM_FEEDBACK,
        );

        return rejectFeedback;
    }

    async approveExamFeedback(feedbackDto: ExamCensorFeedbackDto): Promise<Feedback> {
        const { examFeedback, accountFromId, accountToId } = feedbackDto;

        // Approve all lessons by setting their status to true
        for (const moduleTypeFeedback of examFeedback.moduleTypesFeedback) {
            // Update each lesson's status to true
            await this.moduleTypeService.updateModuleTypestatus(
                moduleTypeFeedback.moduleTypeId,
                true, // Set status to true for approved lessons
            );
        }

        // Create feedback entry for the approved unit
        const approvedFeedback = await this.feedbackRepository.save({
            exam: { id: examFeedback.examId },
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content: 'Approved',
            status: FeedbackStatus.APPROVED,
        });

        console.log('sending notification to user: ', accountToId);
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            `Learning material was approved`,
            FeedbackEventType.EXAM_FEEDBACK,
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

    async getQuestionFeedbackUserId(
        userId: string,
        questionId: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId }, question: { id: questionId } }],
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(QuestionFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    async getAllQuestionFeedbackUserId(
        userId: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId } }],
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(QuestionFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    async getExamFeedbackByUserId(
        userId: string,
        examId: string,
    ): Promise<ExamFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId }, exam: { id: examId } }],
            relations: ['exam', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback.length) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(ExamFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    async getAllExamFeedbackByUserId(userId: string): Promise<ExamFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId } }],
            relations: ['exam', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback.length) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(ExamFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    async getUnitFeedbackByUserId(
        userId: string,
        unitId: string,
    ): Promise<UnitFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId }, unit: { id: unitId } }],
            relations: ['unit', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback.length) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(UnitFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    async getUnitFeedbackWithLesson(
        userId: string,
        unitId: string,
    ): Promise<UnitFeedbackWithLessonResponseDto[]> {
        const feedbacks = await this.feedbackRepository.find({
            where: [
                {
                    accountTo: { id: userId },
                    unit: { id: unitId },
                    lesson: { id: Not(IsNull()) },
                },
            ],
            relations: ['unit', 'lesson', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedbacks.length) {
            throw new Error('No feedback with lessons found');
        }

        // Chuyển đổi dữ liệu sang DTO
        return plainToInstance(UnitFeedbackWithLessonResponseDto, feedbacks, {
            excludeExtraneousValues: true,
        });
    }

    async getLessonFeedbackUserId(
        userId: string,
        lessonId: string,
    ): Promise<QuestionFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: [{ accountTo: { id: userId }, lesson: { id: lessonId } }],
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { updatedat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        // Transform the entity to DTO
        return plainToInstance(QuestionFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    // Fetch feedback for exams with a dynamic status
    async getExamFeedbackByStatus(status: FeedbackStatus): Promise<ExamFeedbackResponseDto[]> {
        if (!Object.values(FeedbackStatus).includes(status)) {
            throw new BadRequestException('Invalid feedback status');
        }

        const feedback = await this.feedbackRepository.find({
            where: { status, exam: { id: Not(IsNull()) } },
            relations: ['exam', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        return plainToInstance(ExamFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    // Fetch feedback for units with a dynamic status
    async getUnitFeedbackByStatus(status: FeedbackStatus): Promise<UnitFeedbackResponseDto[]> {
        if (!Object.values(FeedbackStatus).includes(status)) {
            throw new BadRequestException('Invalid feedback status');
        }
        const feedback = await this.feedbackRepository.find({
            where: { status, unit: { id: Not(IsNull()) } },
            relations: ['unit', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        return plainToInstance(UnitFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }

    // Fetch feedback for questions with a dynamic status
    async getQuestionFeedbackByStatus(status: FeedbackStatus): Promise<QuestionFeedbackResponseDto[]> {
        if (!Object.values(FeedbackStatus).includes(status)) {
            throw new BadRequestException('Invalid feedback status');
        }
        const feedback = await this.feedbackRepository.find({
            where: { status, question: { id: Not(IsNull()) } },
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        return plainToInstance(QuestionFeedbackResponseDto, feedback, {
            excludeExtraneousValues: true,
        });
    }
}
