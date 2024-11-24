import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { Feedback } from 'src/database/entities/feedback.entity';
import { BaseService } from '../base/base.service';
import { LessonService } from '../lesson/lesson.service';
import { LearningMaterialFeedbackDto } from './dto/learning-material-feedback.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
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
import {
    LessonDto,
    UnitFeedbackWithLessonResponseDto,
} from './dto/get-unit-feedback-with-lesson.dto';
import {
    ExamDto,
    FeedbackDetailResponseDto,
    QuestionDto,
    UnitDto,
} from './dto/get-feedback-details.dto';
import { UserFeedbackResponseDto } from './dto/get-user-feedback-details.dto';
import { NotificationDataDto } from 'src/common/dto/notification-data.dto';
import { Unit } from 'src/database/entities/unit.entity';
import { Question } from 'src/database/entities/question.entity';
import { AccountDto } from 'src/common/dto/common.dto';
import { NotificationService } from 'src/nofitication/notification.service';
import { QuestionService } from '../question/question.service';
import { QuestionStatus } from 'src/common/enums/question-status.enum';
import { QuestionMessages } from 'src/common/message/question-message';
import { QuizQuestion } from 'src/database/entities/quizquestion.entity';
import { QuizQuestionService } from '../quizquestion/quiz-question.service';
import { QuizQuestionStatus } from 'src/common/enums/quiz-question.status.enum';
import { UnitService } from '../unit/unit.service';
import { ExamService } from '../exam/exam.service';
import { ExamStatus } from 'src/common/enums/exam-status.enum';
import { QuizQuestionMessages } from 'src/common/message/quiz-question-message';
import { UnitStatus } from 'src/common/enums/unit-status.enum';
import { LearningMaterialMessages } from 'src/common/message/learning-material-message';
import { ExamMessages } from 'src/common/message/exam-message';
import { FeedbackType } from 'src/common/enums/feedback-type.enum';

@Injectable()
export class FeedbackService extends BaseService<Feedback> {
    constructor(
        @InjectRepository(Feedback)
        private readonly feedbackRepository: Repository<Feedback>,
        @Inject(forwardRef(() => UnitService))
        private readonly unitService: UnitService,
        @Inject(forwardRef(() => ExamService))
        private readonly examService: ExamService,
        @Inject(forwardRef(() => LessonService))
        private readonly lessonService: LessonService,
        @Inject(forwardRef(() => QuestionService))
        private readonly questionSerivce: QuestionService,
        @Inject(forwardRef(() => QuizQuestionService))
        private readonly quizQuestionSerivce: QuizQuestionService,
        private readonly feedbackGateway: FeedbacksGateway,
        private readonly accountService: AccountService,
        private readonly moduleTypeService: ModuleTypeService,
        private readonly notificationService: NotificationService,
    ) {
        super(feedbackRepository);
    }

    async getFeedbackDetails(feedbackId: string): Promise<FeedbackDetailResponseDto> {
        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
            relations: [
                'unit',
                'lesson',
                'exam',
                'question',
                'quizquestion',
                'accountFrom',
                'accountTo',
            ],
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
    async submitLearningMaterialFeedback(
        createFeedbackDto: CreateFeedbackDto,
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

        // const nofiticationData: NotificationDataDto = {
        //     data: feedbackList,
        //     message: 'New learning material was submitted',
        // };

        // this.feedbackGateway.sendNotificationToMultipleUsers(
        //     managers.map((manager) => manager.id),
        //     nofiticationData,
        //     FeedbackEventType.UNIT_FEEDBACK,
        // );

        // Prepare notification message
        const notificationMessage = 'New learning material was submitted';

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFrom,
            feedbackList,
            notificationMessage,
            FeedbackType.LEARNING_MATERIAL,
            FeedbackEventType.PUBLISH_LEARNING_MATERIAL,
        );

        return feedbackList;
    }

    async rejectLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<Feedback> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        const unit = await this.unitService.findOneById(unitFeedback.unitId);

        if (!unit || unit.status !== UnitStatus.PENDING) {
            throw new BadRequestException(
                'Learning material has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

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
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            status: FeedbackStatus.REJECTED,
        });

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: rejectFeedback.id, unitId: unitFeedback.unitId },
        //     message: `Learning material was rejected`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.UNIT_FEEDBACK,
        // );

        let notificationMessage;

        if (unit.isActive) {
            notificationMessage = LearningMaterialMessages.MAX_EXCEED_REJECT;
        } else {
            notificationMessage = `${accountFrom.username} has reject your learning material`;
        }

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            rejectFeedback,
            notificationMessage,
            FeedbackType.LEARNING_MATERIAL,
            FeedbackEventType.REJECT_LEARNING_MATERIAL,
        );

        return rejectFeedback;
    }

    async approveLearningMaterialFeedback(
        feedbackDto: LearningMaterialFeedbackDto,
    ): Promise<void> {
        const { unitFeedback, accountFromId, accountToId } = feedbackDto;

        const unit = await this.unitService.findOneById(unitFeedback.unitId);

        if (!unit || unit.status !== UnitStatus.PENDING) {
            throw new BadRequestException(
                'Learning material has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

        // Approve all lessons by setting their status to true
        for (const lessonFeedback of unitFeedback.lessonsFeedback) {
            // Update each lesson's status to true
            await this.lessonService.updateLessonStatus(
                lessonFeedback.lessonId,
                true, // Set status to true for approved lessons
            );
        }

        // // Create feedback entry for the approved unit
        // const approvedFeedback = await this.feedbackRepository.save({
        //     unit: { id: unitFeedback.unitId },
        //     accountFrom: { id: accountFromId },
        //     accountTo: { id: accountToId },
        //     content: 'Approved',
        //     status: FeedbackStatus.APPROVED,
        // });

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: approvedFeedback.id, unitId: unitFeedback.unitId },
        //     message: `Learning material was approved`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.UNIT_FEEDBACK,
        // );

        const notificationMessage = 'Learning material was approved';
        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            unitFeedback.unitId,
            notificationMessage,
            FeedbackType.LEARNING_MATERIAL,
            FeedbackEventType.REJECT_LEARNING_MATERIAL,
        );
    }

    async submitQuestionFeedback(
        createFeedbackDto: CreateFeedbackDto,
        questions: Question[],
    ): Promise<{ feedbackId: string; accountFrom: string }[]> {
        const feedbackList: {
            feedbackId: string;
            questionId: string;
            account: AccountDto;
            createdAt: Date;
        }[] = [];

        //Notify managers when feedback is submitted
        const managers = await this.accountService.findManagers();
        const accountFrom = await this.accountService.findOneById(
            createFeedbackDto.accountFromId,
        );

        if (accountFrom === null) {
            throw new NotFoundException('Account not found');
        }

        // Process feedback for each question
        for (const question of questions) {
            const feedbackData = {
                ...createFeedbackDto,
                question,
                accountFrom,
            };

            const feedback = this.feedbackRepository.create(feedbackData);
            await this.feedbackRepository.save(feedback);

            // Add feedback details to the return list
            feedbackList.push({
                feedbackId: feedback.id,
                questionId: question.id,
                account: {
                    id: accountFrom.id,
                    firstname: accountFrom.firstname,
                    lastname: accountFrom.lastname,
                    username: accountFrom.username,
                    profilePicture: accountFrom.profilepictureurl,
                },
                createdAt: feedback.createdat,
            });
        }

        // Prepare notification message
        const notificationMessage = `${accountFrom.username} has submitted ${feedbackList.length} question(s) for review`;

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFrom,
            feedbackList,
            notificationMessage,
            FeedbackType.QUESTION,
            FeedbackEventType.PUBLISH_QUESTION,
        );

        return feedbackList.map((feedback) => ({
            feedbackId: feedback.feedbackId,
            accountFrom: feedback.account.id,
        }));
    }

    async rejectQuestionFeedback(feedbackDto: QuestionFeedbackDto): Promise<Feedback> {
        const { feedbackId, questionId, content, reason, accountFromId, accountToId } =
            feedbackDto;

        const feedback = await this.feedbackRepository.findOne({
            where: { id: feedbackId },
        });

        const question = await this.questionSerivce.findOneById(questionId);
        if (!question || question.status !== QuestionStatus.PENDING) {
            throw new BadRequestException(
                'Question has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

        const rejectFeedback = await this.feedbackRepository.save({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            reason,
            status: FeedbackStatus.REJECTED,
            question: { id: questionId },
        });

        let notificationMessage;

        if (question.isActive) {
            notificationMessage = QuestionMessages.MAX_EXCEED_REJECT;
        } else {
            notificationMessage = `${accountFrom.username} has reject your question`;
        }

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            rejectFeedback,
            notificationMessage,
            FeedbackType.QUESTION,
            FeedbackEventType.REJECT_QUESTION,
        );

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: rejectFeedback.id, questionId: questionId },
        //     message: `Question was rejected`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.REJECT_QUESTION_FEEDBACK,
        // );

        return rejectFeedback;
    }

    async approveQuestionFeedback(feedbackDto: QuestionFeedbackDto): Promise<void> {
        const { questionId, accountFromId, accountToId } = feedbackDto;

        const question = await this.questionSerivce.findOneById(questionId);

        if (!question || question.status !== QuestionStatus.PENDING) {
            throw new BadRequestException(
                'Question has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

        // const approvedFeedback = await this.feedbackRepository.save({
        //     question: { id: questionId },
        //     accountFrom: { id: accountFromId },
        //     accountTo: { id: accountToId },
        //     content,
        //     status: FeedbackStatus.APPROVED,
        // });

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: approvedFeedback.id, questionId: questionId },
        //     message: `Question was approved`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.APPROVE_QUESTION_FEEDBACK,
        // );

        const notificationMessage = `${accountFrom.username} has approve your question`;

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            questionId,
            notificationMessage,
            FeedbackType.QUESTION,
            FeedbackEventType.APPROVE_QUESTION,
        );
    }

    async submitQuizQuestionFeedback(
        createFeedbackDto: CreateFeedbackDto,
        quizQuestions: QuizQuestion[],
    ): Promise<{ feedbackId: string; accountFrom: string }[]> {
        const feedbackList: {
            feedbackId: string;
            quizQuestionId: string;
            account: AccountDto;
            createdAt: Date;
        }[] = [];

        //Notify managers when feedback is submitted
        const managers = await this.accountService.findManagers();
        const accountFrom = await this.accountService.findOneById(
            createFeedbackDto.accountFromId,
        );

        if (accountFrom === null) {
            throw new NotFoundException('Account not found');
        }

        // Process feedback for each question
        for (const quizQuestion of quizQuestions) {
            const feedbackData = {
                ...createFeedbackDto,
                quizQuestion,
                accountFrom,
            };

            const feedback = this.feedbackRepository.create(feedbackData);
            await this.feedbackRepository.save(feedback);

            // Add feedback details to the return list
            feedbackList.push({
                feedbackId: feedback.id,
                quizQuestionId: quizQuestion.id,
                account: {
                    id: accountFrom.id,
                    firstname: accountFrom.firstname,
                    lastname: accountFrom.lastname,
                    username: accountFrom.username,
                    profilePicture: accountFrom.profilepictureurl,
                },
                createdAt: feedback.createdat,
            });
        }

        // Prepare notification message
        const notificationMessage = `${accountFrom.username} has submitted ${feedbackList.length} quiz question(s) for review`;

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFrom,
            feedbackList,
            notificationMessage,
            FeedbackType.QUIZ_QUESTION,
            FeedbackEventType.PUBLISH_QUIZ_QUESTION,
        );

        return feedbackList.map((feedback) => ({
            feedbackId: feedback.feedbackId,
            accountFrom: feedback.account.id,
        }));
    }

    async rejectQuizQuestionFeedback(
        feedbackDto: QuizQuestionFeedbackDto,
    ): Promise<Feedback> {
        const { quizQuestionId, content, reason, accountFromId, accountToId } =
            feedbackDto;

        const quizQuestion = await this.quizQuestionSerivce.findOneById(quizQuestionId);

        if (!quizQuestion || quizQuestion.status !== QuizQuestionStatus.PENDING) {
            throw new BadRequestException(
                'Quiz Question has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

        const rejectFeedback = await this.feedbackRepository.save({
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            content,
            reason,
            status: FeedbackStatus.REJECTED,
            quizQuestion: { id: quizQuestionId },
        });

        let notificationMessage;

        if (quizQuestion.isActive) {
            notificationMessage = QuestionMessages.MAX_EXCEED_REJECT;
        } else {
            notificationMessage = `${accountFrom.username} has reject your quiz question`;
        }

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            rejectFeedback,
            notificationMessage,
            FeedbackType.QUIZ_QUESTION,
            FeedbackEventType.REJECT_QUIZ_QUESTION,
        );

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: rejectFeedback.id, quizQuestionId: quizQuestionId },
        //     message: `Quiz Question was rejected`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.QUIZ_QUESTION_FEEDBACK,
        // );

        return rejectFeedback;
    }

    async approveQuizQuestionFeedback(
        feedbackDto: QuizQuestionFeedbackDto,
    ): Promise<void> {
        const { quizQuestionId, accountFromId, accountToId } = feedbackDto;

        const quizQuestion = await this.quizQuestionSerivce.findOneById(quizQuestionId);

        if (!quizQuestion || quizQuestion.status !== QuizQuestionStatus.PENDING) {
            throw new BadRequestException(
                'Quiz Question has already been censored by another',
            );
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

        // const approvedFeedback = await this.feedbackRepository.save({
        //     quizQuestion: { id: quizQuestionId },
        //     accountFrom: { id: accountFromId },
        //     accountTo: { id: accountToId },
        //     content,
        //     status: FeedbackStatus.APPROVED,
        // });

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: approvedFeedback.id, quizQuestionId: quizQuestionId },
        //     message: `Quiz Question was Approved`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.QUIZ_QUESTION_FEEDBACK,
        // );

        const notificationMessage = `${accountFrom.username} has approve your quiz question`;

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            quizQuestionId,
            notificationMessage,
            FeedbackType.QUIZ_QUESTION,
            FeedbackEventType.APPROVE_QUIZ_QUESTION,
        );
    }

    async rejectExamFeedback(feedbackDto: ExamCensorFeedbackDto): Promise<Feedback> {
        const { examFeedback, accountFromId, accountToId } = feedbackDto;

        const exam = await this.examService.findOneById(examFeedback.examId);

        if (!exam || exam.status !== ExamStatus.PENDING) {
            throw new BadRequestException('Exam has already been censored by another');
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

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
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
        });

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: rejectFeedback.id, examId: examFeedback.examId },
        //     message: `Exam was rejected`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.EXAM_FEEDBACK,
        // );

        let notificationMessage;

        if (exam.isActive) {
            notificationMessage = ExamMessages.MAX_EXCEED_REJECT;
        } else {
            notificationMessage = `${accountFrom.username} has reject your exam`;
        }

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            rejectFeedback,
            notificationMessage,
            FeedbackType.EXAM,
            FeedbackEventType.REJECT_EXAM,
        );

        return rejectFeedback;
    }

    async approveExamFeedback(feedbackDto: ExamCensorFeedbackDto): Promise<Feedback> {
        const { examFeedback, accountFromId, accountToId } = feedbackDto;

        const exam = await this.examService.findOneById(examFeedback.examId);

        if (!exam || exam.status !== ExamStatus.PENDING) {
            throw new BadRequestException('Exam has already been censored by another');
        }

        const accountFrom = await this.accountService.findOneById(accountFromId);

        if (accountFrom === null) {
            throw new NotFoundException('Account From not found');
        }

        const accountTo = await this.accountService.findOneById(accountToId);

        if (accountTo === null) {
            throw new NotFoundException('Account To not found');
        }

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

        // const nofiticationData: NotificationDataDto = {
        //     data: { feedbackId: approvedFeedback.id, examId: examFeedback.examId },
        //     message: `Exam was approved`,
        // };

        // console.log('sending notification to user: ', accountToId);
        // this.feedbackGateway.sendNotificationToUser(
        //     accountToId,
        //     nofiticationData,
        //     FeedbackEventType.EXAM_FEEDBACK,
        // );

        const notificationMessage = `${accountFrom.username} has approve your exam`;

        await this.notificationService.createAndSendNotification(
            accountTo,
            accountFrom,
            examFeedback.examId,
            notificationMessage,
            FeedbackType.EXAM,
            FeedbackEventType.APPROVE_EXAM,
        );

        return approvedFeedback;
    }

    async getFeedbackByUserId(userId: string): Promise<UserFeedbackResponseDto[]> {
        const feedback = await this.feedbackRepository.find({
            where: { accountTo: { id: userId } },
            relations: ['unit', 'exam', 'question', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        if (!feedback) {
            throw new Error('Feedback not found');
        }

        // Transform the feedback entities into DTOs
        return plainToInstance(UserFeedbackResponseDto, feedback, {
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
    async getExamFeedbackByStatus(
        status: FeedbackStatus,
    ): Promise<ExamFeedbackResponseDto[]> {
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
    async getUnitFeedbackByStatus(
        status: FeedbackStatus,
    ): Promise<UnitFeedbackResponseDto[]> {
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
    async getQuestionFeedbackByStatus(
        status: FeedbackStatus,
    ): Promise<QuestionFeedbackResponseDto[]> {
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

    async searchLearningMaterialFeedbackByStatus(
        status: FeedbackStatus,
        userId: string,
        search?: string,
        domain?: string,
        section?: string,
        level?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }

        const where: any = {
            // ...(
            //     status === FeedbackStatus.PENDING
            //     ? { accountFrom: { id: userId } }
            //     : { accountTo: { id: userId } }),
            status,
        };

        where.unit = {
            ...(search && { title: Like(`%${search}%`) }),
            id: Not(IsNull()),
        };

        if (domain) {
            where.domain = { id: domain };
        }
        if (section) {
            where.section = { id: section };
        }
        if (level) {
            where.level = { id: level };
        }

        // Truy vấn dữ liệu feedback
        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: [
                'unit',
                'unit.section',
                'unit.level',
                'unit.domain',
                'unit.unitAreas',
                'unit.unitAreas.lessons',
                'unit.unitAreas.lessons.lessonContents',
                'accountFrom',
                'accountTo',
                'lesson',
            ],
            order: { createdat: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = feedbacks.map((feedback) => {
            const unit = feedback.unit;

            return {
                id: unit.id,
                title: unit.title,
                description: unit.description,
                createdat: unit.createdat,
                status: unit.status,
                accountFrom: feedback.accountFrom
                    ? {
                          id: feedback.accountFrom.id,
                          username: feedback.accountFrom.username,
                          email: feedback.accountFrom.email,
                      }
                    : null,
                accountTo: feedback.accountTo
                    ? {
                          id: feedback.accountTo.id,
                          username: feedback.accountTo.username,
                          email: feedback.accountTo.email,
                      }
                    : null,
                unitAreas: Array.isArray(unit.unitAreas)
                    ? unit.unitAreas.map((unitArea) => ({
                          id: unitArea.id,
                          title: unitArea.title,
                          lessons: Array.isArray(unitArea.lessons)
                              ? unitArea.lessons.map((lesson) => ({
                                    id: lesson.id,
                                    prerequisitelessonid: lesson.prerequisitelessonid,
                                    type: lesson.type,
                                    title: lesson.title,
                                    status: lesson.status,
                                    reason:
                                        feedback.lesson?.id === lesson.id
                                            ? feedback.reason
                                            : null,
                                    content:
                                        feedback.lesson?.id === lesson.id
                                            ? feedback.content
                                            : null,
                                    lessonContents: Array.isArray(lesson.lessonContents)
                                        ? lesson.lessonContents.map((content) => ({
                                              id: content.id,
                                              title: content.title,
                                              contentType: content.contentType,
                                              contents: Array.isArray(content.contents)
                                                  ? content.contents.map((c) => ({
                                                        contentId: c.contentId,
                                                        text: c.text,
                                                        examples: Array.isArray(
                                                            c.examples,
                                                        )
                                                            ? c.examples.map((e) => ({
                                                                  exampleId: e.exampleId,
                                                                  content: e.content,
                                                                  explain:
                                                                      e.explain || '',
                                                              }))
                                                            : [],
                                                    }))
                                                  : [],
                                              question: content.question
                                                  ? {
                                                        questionId:
                                                            content.question.questionId,
                                                        prompt: content.question.prompt,
                                                        correctAnswer:
                                                            content.question
                                                                .correctAnswer,
                                                        explanation:
                                                            content.question
                                                                .explanation || '',
                                                        answers: Array.isArray(
                                                            content.question.answers,
                                                        )
                                                            ? content.question.answers.map(
                                                                  (a) => ({
                                                                      answerId:
                                                                          a.answerId,
                                                                      text: a.text,
                                                                      label: a.label,
                                                                  }),
                                                              )
                                                            : [],
                                                    }
                                                  : null, // Handle null if no question
                                          }))
                                        : [],
                                }))
                              : [],
                      }))
                    : [],
                section: unit.section
                    ? {
                          id: unit.section.id,
                          name: unit.section.name,
                      }
                    : null,
                level: unit.level
                    ? {
                          id: unit.level.id,
                          name: unit.level.name,
                      }
                    : null,
                domain: unit.domain
                    ? {
                          id: unit.domain.id,
                          name: unit.domain.content,
                      }
                    : null,
                // Include counts for unitAreas and lessons
                unitAreaCount: unit.unitAreas.length,
                lessonCount: unit.unitAreas.reduce(
                    (count, area) => count + area.lessons.length,
                    0,
                ),
            };
        });

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }

    async searchExamFeedbackByStatus(
        status: FeedbackStatus,
        userId: string,
        search?: string,
        examType?: string,
        examStructure?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }

        const where: any = {
            ...(status === FeedbackStatus.PENDING
                ? { accountFrom: { id: userId } }
                : { accountTo: { id: userId } }),
            status,
        };

        where.exam = {
            ...(search && { title: Like(`%${search}%`) }),
            id: Not(IsNull()),
        };

        if (examType) {
            where['exam.examType'] = { id: examType };
        }
        if (examStructure) {
            where['exam.examStructure'] = { id: examStructure };
        }

        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: [
                'exam',
                'exam.examType',
                'exam.examStructure',
                'exam.examStructure.examSemester',
                'exam.examStructure.examStructureType',
                'exam.examquestion',
                'exam.examquestion.moduleType',
                'exam.examquestion.question',
                'accountFrom',
                'accountTo',
            ],
            order: { createdat: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = feedbacks.map((feedback) => {
            const exam = feedback.exam;

            return {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                createdat: exam.createdat,
                status: feedback.status,
                accountFrom: feedback.accountFrom
                    ? {
                          id: feedback.accountFrom.id,
                          username: feedback.accountFrom.username,
                          email: feedback.accountFrom.email,
                      }
                    : null,
                accountTo: feedback.accountTo
                    ? {
                          id: feedback.accountTo.id,
                          username: feedback.accountTo.username,
                          email: feedback.accountTo.email,
                      }
                    : null,
                examType: exam.examType
                    ? {
                          id: exam.examType.id,
                          name: exam.examType.name,
                          status: exam.examType.status,
                      }
                    : null,
                examStructure: exam.examStructure
                    ? {
                          id: exam.examStructure.id,
                          structurename: exam.examStructure.structurename,
                          description: exam.examStructure.description,
                          examSemester: exam.examStructure.examSemester
                              ? {
                                    id: exam.examStructure.examSemester.id,
                                    title: exam.examStructure.examSemester.title,
                                }
                              : null,
                          examStructureType: exam.examStructure.examStructureType
                              ? {
                                    id: exam.examStructure.examStructureType.id,
                                    name: exam.examStructure.examStructureType.name,
                                }
                              : null,
                      }
                    : null,
                questionCount: Array.isArray(exam.examquestion)
                    ? exam.examquestion.length
                    : 0,
            };
        });

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }

    async searchQuestionFeedbackByStatus(
        status: FeedbackStatus,
        userId: string,
        search?: string,
        level?: string,
        skill?: string,
        section?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }

        const where: any = {
            ...(status === FeedbackStatus.PENDING
                ? { accountFrom: { id: userId } }
                : { accountTo: { id: userId } }),
            status,
        };

        where.question = {
            ...(search && { content: Like(`%${search}%`) }),
            id: Not(IsNull()),
        };

        if (level) {
            where['question.level'] = { id: level };
        }
        if (skill) {
            where['question.skill'] = { id: skill };
        }
        if (section) {
            where['question.section'] = { id: section };
        }

        // Truy vấn dữ liệu feedback
        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: [
                'question',
                'question.level',
                'question.skill',
                'question.section',
                'question.answers',
                'accountFrom',
                'accountTo',
            ],
            order: { createdat: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = feedbacks.map((feedback) => {
            const question = feedback.question;

            return {
                id: question.id,
                content: question.content,
                plainContent: question.plainContent,
                explain: question.explain,
                createdat: question.createdat,
                status: feedback.status,
                accountFrom: feedback.accountFrom
                    ? {
                          id: feedback.accountFrom.id,
                          username: feedback.accountFrom.username,
                          email: feedback.accountFrom.email,
                      }
                    : null,
                accountTo: feedback.accountTo
                    ? {
                          id: feedback.accountTo.id,
                          username: feedback.accountTo.username,
                          email: feedback.accountTo.email,
                      }
                    : null,
                level: question.level
                    ? {
                          id: question.level.id,
                          name: question.level.name,
                      }
                    : null,
                skill: question.skill
                    ? {
                          id: question.skill.id,
                          content: question.skill.content,
                      }
                    : null,
                section: question.section
                    ? {
                          id: question.section.id,
                          name: question.section.name,
                      }
                    : null,
                answers: Array.isArray(question.answers)
                    ? question.answers.map((answer) => ({
                          id: answer.id,
                          text: answer.text,
                          plaintext: answer.plaintext,
                          isCorrectAnswer: answer.isCorrectAnswer,
                      }))
                    : [],
                answerCount: Array.isArray(question.answers)
                    ? question.answers.length
                    : 0,
            };
        });

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }

    async searchQuizQuestionFeedbackByStatus(
        status: FeedbackStatus,
        userId: string,
        search?: string,
        level?: string,
        skill?: string,
        section?: string,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        totalPages: number;
        currentPage: number;
    }> {
        if (!status) {
            throw new BadRequestException('Status is required');
        }
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        const where: any = {
            ...(status === FeedbackStatus.PENDING
                ? { accountFrom: { id: userId } }
                : { accountTo: { id: userId } }),
            status,
        };

        where.quizquestion = {
            ...(search && { content: Like(`%${search}%`) }),
            id: Not(IsNull()),
        };

        if (level) {
            where['quizquestion.level'] = { id: level };
        }
        if (skill) {
            where['quizquestion.skill'] = { id: skill };
        }
        if (section) {
            where['quizquestion.section'] = { id: section };
        }

        // Truy vấn dữ liệu feedback
        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: [
                'quizquestion',
                'quizquestion.level',
                'quizquestion.skill',
                'quizquestion.section',
                'quizquestion.answers',
                'accountFrom',
                'accountTo',
            ],
            order: { createdat: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = feedbacks.map((feedback) => {
            const quizQuestion = feedback.quizquestion;

            return {
                id: quizQuestion.id,
                content: quizQuestion.content,
                plainContent: quizQuestion.plainContent,
                explain: quizQuestion.explain,
                createdat: quizQuestion.createdat,
                status: feedback.status,
                accountFrom: feedback.accountFrom
                    ? {
                          id: feedback.accountFrom.id,
                          username: feedback.accountFrom.username,
                          email: feedback.accountFrom.email,
                      }
                    : null,
                accountTo: feedback.accountTo
                    ? {
                          id: feedback.accountTo.id,
                          username: feedback.accountTo.username,
                          email: feedback.accountTo.email,
                      }
                    : null,
                level: quizQuestion.level
                    ? {
                          id: quizQuestion.level.id,
                          name: quizQuestion.level.name,
                      }
                    : null,
                skill: quizQuestion.skill
                    ? {
                          id: quizQuestion.skill.id,
                          content: quizQuestion.skill.content,
                      }
                    : null,
                section: quizQuestion.section
                    ? {
                          id: quizQuestion.section.id,
                          name: quizQuestion.section.name,
                      }
                    : null,
                answers: Array.isArray(quizQuestion.answers)
                    ? quizQuestion.answers.map((answer) => ({
                          id: answer.id,
                          text: answer.text,
                          plaintext: answer.plaintext,
                          isCorrectAnswer: answer.isCorrectAnswer,
                      }))
                    : [],
                answerCount: Array.isArray(quizQuestion.answers)
                    ? quizQuestion.answers.length
                    : 0,
            };
        });

        return {
            data,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page,
        };
    }

    async getRejectFeedbackByQuestionId(questionId: string): Promise<{
        data: any[];
        totalItems: number;
    }> {
        if (!questionId) {
            throw new BadRequestException('Question ID is required');
        }

        const where: any = {
            question: { id: questionId },
            status: FeedbackStatus.REJECTED,
        };

        // Fetch feedback with pagination
        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: ['question', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        if (feedbacks.length === 0) {
            throw new NotFoundException('No feedbacks found');
        }

        // Map feedbacks to the desired structure
        const data = feedbacks.map((feedback) => ({
            id: feedback.id,
            content: feedback.content,
            reason: feedback.reason,
            status: feedback.status,
            createdat: feedback.createdat,
            updatedat: feedback.updatedat,
            //nếu muốn get thêm question
            // question: feedback.question
            //     ? {
            //           id: feedback.question.id,
            //           content: feedback.question.content,
            //           plainContent: feedback.question.plainContent,
            //           explain: feedback.question.explain,
            //       }
            //     : null,
            accountFrom: feedback.accountFrom
                ? {
                      id: feedback.accountFrom.id,
                      username: feedback.accountFrom.username,
                      email: feedback.accountFrom.email,
                  }
                : null,
            accountTo: feedback.accountTo
                ? {
                      id: feedback.accountTo.id,
                      username: feedback.accountTo.username,
                      email: feedback.accountTo.email,
                  }
                : null,
        }));

        return {
            data,
            totalItems,
            // totalPages: Math.ceil(totalItems / limit),
            // currentPage: page,
        };
    }

    async getRejectFeedbackByExamId(questionId: string): Promise<{
        data: any[];
        totalItems: number;
    }> {
        if (!questionId) {
            throw new BadRequestException('Exam ID is required');
        }

        const where: any = {
            question: { id: questionId },
            status: FeedbackStatus.REJECTED,
        };

        // Fetch feedback with pagination
        const [feedbacks, totalItems] = await this.feedbackRepository.findAndCount({
            where,
            relations: ['exam', 'accountFrom', 'accountTo'],
            order: { createdat: 'DESC' },
        });

        if (feedbacks.length === 0) {
            throw new NotFoundException('No feedbacks found');
        }

        // Map feedbacks to the desired structure
        const data = feedbacks.map((feedback) => ({
            id: feedback.id,
            content: feedback.content,
            reason: feedback.reason,
            status: feedback.status,
            createdat: feedback.createdat,
            updatedat: feedback.updatedat,
            accountFrom: feedback.accountFrom
                ? {
                      id: feedback.accountFrom.id,
                      username: feedback.accountFrom.username,
                      email: feedback.accountFrom.email,
                  }
                : null,
            accountTo: feedback.accountTo
                ? {
                      id: feedback.accountTo.id,
                      username: feedback.accountTo.username,
                      email: feedback.accountTo.email,
                  }
                : null,
        }));

        return {
            data,
            totalItems,
        };
    }

    async submitExamFeedback(
        createFeedbackDto: CreateFeedbackDto,
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

        // Prepare notification message
        const notificationMessage = 'New exam was submitted';

        // Delegate notification handling to NotificationService
        await this.notificationService.createAndSendMultipleNotifications(
            managers,
            accountFrom,
            feedbackList,
            notificationMessage,
            FeedbackType.EXAM,
            FeedbackEventType.PUBLISH_EXAM,
        );

        return feedbackList;
    }
}
