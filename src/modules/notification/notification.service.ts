import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { AccountDto } from 'src/common/dto/common.dto';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { FeedbackType } from 'src/common/enums/feedback-type.enum';
import { Account } from 'src/database/entities/account.entity';
import { Notification } from 'src/database/entities/notification.entity';
import { FeedbacksGateway } from 'src/modules/socket/feedback.gateway';
import { Repository } from 'typeorm';
import { SocketNotificationDto } from './notification.dto';
import { AccountService } from 'src/modules/account/account.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
        private readonly feedbackGateway: FeedbacksGateway,
        @Inject(forwardRef(() => AccountService))
        private readonly accountService: AccountService
    ) {}

    async createAndSendMultipleNotifications(
        accountTos: Account[],
        accountFromId: string,
        notificationData: any,
        message: string,
        type: FeedbackType,
        eventType: FeedbackEventType,
    ): Promise<void> {
        const notifications = accountTos.map((accountTo) => ({
            message,
            data: notificationData,
            accountFrom: { id: accountFromId },
            accountTo: accountTo,
            isRead: false,
            type: type,
            eventType: eventType,
        }));

        await this.notificationRepository.save(notifications);
        const account = await this.accountService.findById(accountFromId);
        
        const socketNotification = {accountFrom: account, message: message, createdAt: new Date()} as SocketNotificationDto;
        this.feedbackGateway.sendNotificationToMultipleUsers(
            accountTos.map((accountTo) => accountTo.id),
            socketNotification,
            type,
            eventType,
        );
    }

    async createAndSendMultipleNotificationsNew(
        accountToIds: string[],
        accountFromId: string,
        notificationData: any,
        message: string,
        type: FeedbackType,
        eventType: FeedbackEventType,
    ): Promise<void> {
        const notifications = accountToIds.map((accountToId) => ({
            message,
            data: notificationData,
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            isRead: false,
            type: type,
            eventType: eventType,
        }));

        await this.notificationRepository.save(notifications);
        const account = await this.accountService.findById(accountFromId);
        const socketNotification = {accountFrom: account, message: message, createdAt: new Date()} as SocketNotificationDto;

        this.feedbackGateway.sendNotificationToMultipleUsers(
            accountToIds,
            socketNotification,
            type,
            eventType,
        );
    }
    

    async createAndSendNotification(
        accountToId: string,
        accountFromId: string,
        notificationData: any,
        message: string,
        type: FeedbackType,
        eventType: FeedbackEventType,
    ): Promise<void> {
        const notification = {
            message,
            data: notificationData,
            accountFrom: { id: accountFromId },
            accountTo: { id: accountToId },
            isRead: false,
            type: type,
            eventType: eventType,
        };

        await this.notificationRepository.save(notification);
        const account = await this.accountService.findById(accountFromId);
        const socketNotification = {accountFrom: account, message: message, createdAt: new Date()} as SocketNotificationDto;
        this.feedbackGateway.sendNotificationToUser(
            accountToId,
            socketNotification,
            type,
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

    async markAllAsRead(accountId: string): Promise<void> {
        const result = await this.notificationRepository.update(
            { accountTo: { id: accountId } }, // Filter notifications for the user
            { isRead: true },
        );
        if (result.affected === 0) {
            throw new NotFoundException('No unread notifications found for this user');
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
            eventType: notification.eventType,
            createdAt: notification.createdat,
            accountFrom: plainToInstance(AccountDto, {
                id: notification.accountFrom.id,
                username: notification.accountFrom.username,
                firstname: notification.accountFrom.firstname,
                lastname: notification.accountFrom.lastname,
                profilepictureurl: notification.accountFrom.profilepictureurl,
            }),
            accountTo: plainToInstance(AccountDto, {
                id: notification.accountTo.id,
                username: notification.accountTo.username,
                firstname: notification.accountTo.firstname,
                lastname: notification.accountTo.lastname,
                profilepictureurl: notification.accountTo.profilepictureurl,
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
