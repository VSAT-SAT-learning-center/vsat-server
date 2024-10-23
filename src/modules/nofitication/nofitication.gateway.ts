import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications' })
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;
    private users: Map<string, Socket> = new Map(); // Store active users

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    typescript;
    CopyInsert;
    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId;
        if (Array.isArray(userId)) {
            // Handle the case where userId is an array
            console.error('Multiple user IDs received');
            return;
        }
        if (userId) {
            this.users.set(userId, client);
            console.log(`User connected: ${userId}`);
        }
    }

    handleDisconnect(client: Socket) {
        const userId = [...this.users.entries()].find(
            ([key, socket]) => socket.id === client.id,
        )?.[0];
        if (userId) {
            this.users.delete(userId);
            console.log(`User disconnected: ${userId}`);
        }
    }

    // Function to send notification to a specific user
    sendNotificationToUser(userId: string, message: string) {
        const userSocket = this.users.get(userId);
        if (userSocket) {
            userSocket.emit('notification', message);
            console.log(`Notification sent to user: ${userId}`);
        } else {
            console.log(`User not connected: ${userId}`);
        }
    }

    // Broadcast notification to all users
    broadcastNotification(message: string) {
        this.server.emit('notification', message);
    }

    // Handle incoming notifications between users
    @SubscribeMessage('sendToUser')
    handleSendToUser(
        client: Socket,
        data: { userId: string; message: string },
    ) {
        const { userId, message } = data;
        this.sendNotificationToUser(userId, message);
    }

    // Allow users to broadcast notifications to all users
    @SubscribeMessage('broadcast')
    handleBroadcast(client: Socket, message: string) {
        this.broadcastNotification(message);
    }
}
