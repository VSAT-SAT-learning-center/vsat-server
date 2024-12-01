import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification } from 'src/database/entities/notification.entity';
import { FeedbacksGateway } from 'src/modules/nofitication/feedback.gateway';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from 'src/modules/account/account.module';

@Module({
    imports: [TypeOrmModule.forFeature([Notification]), forwardRef(() => AccountModule)],
    providers: [NotificationService, FeedbacksGateway, JwtService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
