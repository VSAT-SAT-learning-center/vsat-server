import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3001, { namespace: '/feedbacks', cors: { origin: '*' } })
export class FeedbacksGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); // Store active users

    afterInit(server: Server) {
        console.log('WebSocket server initialized for feedbacks');
    }

    handleConnection(client: Socket) {
        console.log('Client connected: ' + client.id);
        const userId = client.handshake.query.userId;
        if (userId) {
            this.users.set(userId as string, client);
            console.log(`User connected: ${userId}`);
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

    // Send notification to specific user
    sendNotificationToUser(userId: string, message: string) {
        const userSocket = this.users.get(userId);
        if (userSocket) {
            userSocket.emit('feedbackNotification', message);
            console.log(`Notification sent to user: ${userId}`);
        } else {
            console.log(`User not connected: ${userId}`);
        }
    }

    // Broadcast to all connected users
    broadcastNotification(message: string) {
        console.log('Broadcasting feedback notification...');
        this.server.emit('feedbackNotification', message);
    }

    // For testing purpose: register user
    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, data: { userId: string }) {
        const { userId } = data;
        if (userId) {
            this.users.set(userId, client);
            console.log(`User registered: ${userId}`);
        }
    }

    // For testing: broadcast feedback notification to all
    @SubscribeMessage('broadcastFeedback')
    handleBroadcastFeedback(client: Socket, message: string) {
        this.broadcastNotification(message);
    }
}
