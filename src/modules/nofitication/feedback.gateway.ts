import { UnauthorizedException } from '@nestjs/common';
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
import { Feedback } from 'src/database/entities/feedback.entity';

@WebSocketGateway(3001, { namespace: '/feedbacks', cors: { origin: '*' } })
export class FeedbacksGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); // Store active users

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.query.token as string;
            if (!token) {
                throw new UnauthorizedException('No token provided');
            }

            console.log('Client connected: ' + client.id);
            const userId = client.handshake.query.userId;
            if (userId) {
                this.users.set(userId as string, client);
                console.log(`User connected: ${userId}`);
            }

            // // Verify the token using JWT service
            // const payload = this.jwtService.verify(token);
            // if (payload) {
            //     // Store authenticated user
            //     this.users.set(payload.userId, client);
            //     console.log(`User authenticated and connected: ${payload.userId}`);
            // }
        } catch (error) {
            console.log('Authentication failed:', error.message);
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
        message: string,
        eventType: FeedbackEventType,
    ) {
        userIds.forEach((userId) => {
            this.sendNotificationToUser(userId, message, eventType);
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
        
        if (to) {
            this.server.to(to).emit(event, payload);
        } else {
            this.server.emit(event, payload);
        }
    }

    feedbackEvent(feedback: Feedback): string {
        if (feedback.unit) {
            return FeedbackEventType.UNIT_FEEDBACK;
        }

        if (feedback.exam) {
            return FeedbackEventType.EXAM_FEEDBACK;
        }

        if (feedback.question) {
            return FeedbackEventType.QUESTION_FEEDBACK;
        }
        if (feedback.lesson) {
            return FeedbackEventType.LESSON_FEEDBACK;
        }

        return null;
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
