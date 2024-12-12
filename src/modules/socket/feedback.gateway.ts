import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { FeedbackType } from 'src/common/enums/feedback-type.enum';
import { SocketNotificationDto } from 'src/modules/notification/notification.dto';

@WebSocketGateway({
    namespace: '/socket',
    cors: {
        //origin: '*',
        origin: ['https://vsatcenter.edu.vn'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class FeedbacksGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); 

    constructor(private readonly jwtService: JwtService) {}

    afterInit(server: Server) {
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;
            if (!token) {
                throw new UnauthorizedException('No token provided');
            }

            // Verify the token
            const payload = this.jwtService.verify(token, {
                secret: process.env.ACCESS_TOKEN_KEY,
            });
            if (!payload || !payload.id) {
                throw new UnauthorizedException('Invalid token');
            }

            const userId = payload.id;
            this.users.set(userId, client); 
        } catch (error) {
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.users.entries()].find(
            ([, socket]) => socket.id === client.id,
        )?.[0];
        if (userId) {
            this.users.delete(userId);
        }
    }

    sendNotificationToUser(
        userId: string,
        data: SocketNotificationDto,
        type: FeedbackType,
        eventType: FeedbackEventType,
    ) {
        const userSocket = this.users.get(userId);
        if (userSocket) {
            this.handleEmitSocket({
                data: data,
                event: 'feedbackNotification',
                type: type,
                eventType: eventType,
                to: userSocket.id,
            });
        } else {
            console.log(`User not connected: ${userId}`);
        }
    }

    sendNotificationToMultipleUsers(
        userIds: string[],
        data: SocketNotificationDto,
        type: FeedbackType,
        eventType: FeedbackEventType,
    ) {
        userIds.forEach((userId) => {
            this.sendNotificationToUser(userId, data, type, eventType);
        });
    }

    broadcastNotification(data: any) {
        this.handleEmitSocket({
            data: data,
            event: 'feedbackNotification',
            type: FeedbackType.UNKNOWN,
        });
    }

    handleEmitSocket({
        data,
        event,
        type,
        eventType,
        to,
    }: {
        data: any;
        event: any;
        type: any;
        eventType?: any;
        to?: any;
    }) {
        const payload = {
            type: type,
            eventType: eventType,
            data: data,
        };

        if (to) {
            this.server.to(to).emit(event, payload);
        } else {
            this.server.emit(event, payload);
        }
    }

    @SubscribeMessage('broadcast')
    handleBroadcast(client: Socket, message: string) {
        this.broadcastNotification(message);
    }
}
