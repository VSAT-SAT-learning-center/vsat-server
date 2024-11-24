import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AccountDto } from 'src/common/dto/common.dto';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { Account } from 'src/database/entities/account.entity';
import { Notification } from 'src/database/entities/notification.entity';
import { FeedbacksGateway } from 'src/modules/nofitication/feedback.gateway';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly feedbackGateway: FeedbacksGateway,
    ) {}

    async createAndSendMultipleNotifications(
        managers: Account[],
        accountFrom: Account,
        notificationData: any,
        message: string,
        eventType: FeedbackEventType,
    ): Promise<void> {
        const notifications = managers.map((manager) => ({
            message,
            data: notificationData,
            accountFrom,
            accountTo: manager,
            isRead: false,
            type: eventType,
        }));

        await this.notificationRepository.save(notifications);

        this.feedbackGateway.sendNotificationToMultipleUsers(
            managers.map((manager) => manager.id),
            { data: notificationData, message },
            eventType,
        );
    }

    async createAndSendNotification(
        accountTo: Account,
        accountFrom: Account,
        notificationData: any,
        message: string,
        eventType: FeedbackEventType,
    ): Promise<void> {
        const notification = {
            message,
            data: notificationData,
            accountFrom,
            accountTo: accountTo,
            isRead: false,
            type: eventType,
        };

        await this.notificationRepository.save(notification);

        this.feedbackGateway.sendNotificationToUser(
            accountTo.id,
            { data: notificationData, message },
            eventType,
        );
    }

    async markAsRead(notificationId: string): Promise<void> {
        const result = await this.notificationRepository.update(notificationId, {
            isRead: true,
        });
        if (result.affected === 0) {
            throw new NotFoundException('Notification not found');
        }
    }



    async getNotificationsForUser(
        userId: string,
        isRead?: boolean,
        // page: number = 1,
        // limit: number = 10,
    ): Promise<{
        data: any[];
        totalItems: number;
        // totalPages: number;
        // currentPage: number;
    }> {
        if (!userId) {
            throw new BadRequestException('User ID is required');
        }

        const where: any = { accountTo: { id: userId } };

        if (isRead !== undefined) {
            where.isRead = isRead;
        }

        const [notifications, totalItems] =
            await this.notificationRepository.findAndCount({
                where,
                relations: ['accountFrom', 'accountTo'],
                order: { createdat: 'DESC' },
                // skip: (page - 1) * limit,
                // take: limit,
            });

        const data = notifications.map((notification) => ({
            id: notification.id,
            message: notification.message,
            data: notification.data,
            isRead: notification.isRead,
            type: notification.type,
            createdAt: notification.createdat,
            accountFrom: plainToInstance(AccountDto, {
                id: notification.accountFrom.id,
                username: notification.accountFrom.username,
                firstname: notification.accountFrom.firstname,
                lastname: notification.accountFrom.lastname,
                profilePicture: notification.accountFrom.profilepictureurl,
            }),
            accountTo: plainToInstance(AccountDto, {
                id: notification.accountTo.id,
                username: notification.accountTo.username,
                firstname: notification.accountTo.firstname,
                lastname: notification.accountTo.lastname,
                profilePicture: notification.accountTo.profilepictureurl,
            }),
        }));

        return {
            data,
            totalItems,
            // totalPages: Math.ceil(totalItems / limit),
            // currentPage: page,
        };
    }
}
