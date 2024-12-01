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
        origin: ['https://vsatcenter.edu.vn'], // Replace with your frontend domain
        methods: ['GET', 'POST'],
        credentials: true,
    },
})
export class FeedbacksGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); // Store active users

    constructor(private readonly jwtService: JwtService) {}

    afterInit(server: Server) {
        //console.log('WebSocket server initialized');
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
            this.users.set(userId, client); // Store the socket connection
            // console.log(`User authenticated and connected: ${userId}`);
        } catch (error) {
            // console.error('Authentication failed:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        //console.log('Client disconnected: ' + client.id);
        const userId = [...this.users.entries()].find(
            ([, socket]) => socket.id === client.id,
        )?.[0];
        if (userId) {
            this.users.delete(userId);
            //console.log(`User disconnected: ${userId}`);
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
            //console.log(`Notification sent to user: ${userId}`);
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
        // console.log('Broadcasting feedback notification...');
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

        //console.log("Payload is: ",payload);

        if (to) {
            this.server.to(to).emit(event, payload);
        } else {
            this.server.emit(event, payload);
        }
    }

    // // @SubscribeMessage('sendToUser')
    // // handleSendToUser(
    // //     client: Socket,
    // //     data: {
    // //         userId: string;
    // //         message: string;
    // //         type?: FeedbackType;
    // //         eventType?: FeedbackEventType;
    // //     },
    // // ) {
    // //     const { userId, message, eventType, type } = data;
    // //     this.sendNotificationToUser(userId, message, type, eventType);
    // // }

    // // @SubscribeMessage('sendToMultipleUsers')
    // // handleSendToMultipleUsers(
    // //     client: Socket,
    // //     data: {
    // //         userIds: string[];
    // //         message: string;
    // //         type?: FeedbackType;
    // //         eventType?: FeedbackEventType;
    // //     },
    // // ) {
    // //     const { userIds, message, type, eventType } = data;
    // //     this.sendNotificationToMultipleUsers(userIds, message, type, eventType);
    // // }

    @SubscribeMessage('broadcast')
    handleBroadcast(client: Socket, message: string) {
        this.broadcastNotification(message);
    }
}
