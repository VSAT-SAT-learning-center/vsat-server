import { forwardRef, Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification } from 'src/database/entities/notification.entity';
import { FeedbacksGateway } from 'src/modules/socket/feedback.gateway';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from 'src/modules/account/account.module';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Notification]),
        forwardRef(() => AccountModule),
        SocketModule,
    ],
    providers: [NotificationService],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}
