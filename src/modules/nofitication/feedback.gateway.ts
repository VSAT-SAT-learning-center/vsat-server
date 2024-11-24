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
import { Console } from 'console';
import { Server, Socket } from 'socket.io';
import { FeedbackEventType } from 'src/common/enums/feedback-event-type.enum';
import { Feedback } from 'src/database/entities/feedback.entity';

@WebSocketGateway(5001, { namespace: '/feedbacks', cors: { origin: '*' } })
export class FeedbacksGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); // Store active users

    constructor(private readonly jwtService: JwtService) {}

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
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
            console.log(`User authenticated and connected: ${userId}`);
        } catch (error) {
            console.error('Authentication failed:', error.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected: ' + client.id);
        const userId = [...this.users.entries()].find(
            ([, socket]) => socket.id === client.id,
        )?.[0];
        if (userId) {
            this.users.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }

    sendNotificationToUser(
        userId: string,
        data: any,
        eventType: FeedbackEventType,
    ) {
        const userSocket = this.users.get(userId);
        if (userSocket) {
            this.handleEmitSocket({
                data: data,
                event: 'feedbackNotification',
                eventType: eventType,
                to: userSocket.id,
            });
            console.log(`Notification sent to user: ${userId}`);
        } else {
            console.log(`User not connected: ${userId}`);
        }
    }

    sendNotificationToMultipleUsers(
        userIds: string[],
        data: any,
        eventType: FeedbackEventType,
    ) {
        userIds.forEach((userId) => {
            this.sendNotificationToUser(userId, data, eventType);
        });
    }
    

    broadcastNotification(data: any) {
        console.log('Broadcasting feedback notification...');
        this.handleEmitSocket({
            data: data,
            event: 'feedbackNotification',
        });
    }

    handleEmitSocket({
        data,
        event,
        eventType,
        to,
    }: {
        data: any;
        event: any;
        eventType?: any;
        to?: any;
    }) {
        const payload = {
            eventType: eventType,
            data: data
        };

        console.log("Payload is: ",payload);
        
        if (to) {
            this.server.to(to).emit(event, payload);
        } else {
            this.server.emit(event, payload);
        }
    }

    @SubscribeMessage('sendToUser')
    handleSendToUser(
        client: Socket,
        data: {
            userId: string;
            message: string;
            eventType?: FeedbackEventType;
        },
    ) {
        const { userId, message, eventType } = data;
        this.sendNotificationToUser(userId, message, eventType);
    }

    @SubscribeMessage('sendToMultipleUsers')
    handleSendToMultipleUsers(
        client: Socket,
        data: {
            userIds: string[];
            message: string;
            eventType?: FeedbackEventType;
        },
    ) {
        const { userIds, message, eventType } = data;
        this.sendNotificationToMultipleUsers(userIds, message, eventType);
    }

    @SubscribeMessage('broadcast')
    handleBroadcast(client: Socket, message: string) {
        this.broadcastNotification(message);
    }
}
