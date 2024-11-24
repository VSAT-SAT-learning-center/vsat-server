import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification } from 'src/database/entities/notification.entity';
import { FeedbacksGateway } from 'src/modules/nofitication/feedback.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
    ],
    providers: [NotificationService, FeedbacksGateway, JwtService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
