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

@WebSocketGateway(3001, { namespace: '/notifications', cors: { origin: '*' } })
export class NotificationsGateway
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
        
        // The userId will be registered later via the 'registerUser' event
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

    // Handle the 'registerUser' event to store the userId
    @SubscribeMessage('registerUser')
    handleRegisterUser(client: Socket, data: { userId: string }) {
        const { userId } = data;
        if (!userId) {
            console.error('Missing userId in registration');
            return;
        }

        if (this.users.has(userId)) {
            console.log(
                `User ${userId} is already connected. Replacing old connection.`,
            );
            const existingSocket = this.users.get(userId);
            if (existingSocket) {
                existingSocket.disconnect(); // Disconnect the old connection
            }
        }

        this.users.set(userId, client);
        console.log(`User registered: ${userId}`);
    }

    // Function to send notification to a specific user
    sendNotificationToUser(userId: string, message: string) {
        const userSocket = this.users.get(userId);
        if (userSocket) {
            this.handleEmitSocket({
                data: message,
                event: 'feedbackNotification',
                to: userSocket.id, // Emit specifically to the user's socket ID
            });
            console.log(`Notification sent to user: ${userId}`);
        } else {
            console.log(`User not connected: ${userId}`);
        }
    }

    // Broadcast notification to all users
    broadcastNotification(message: string) {
        console.log('Broadcasting feedback notification...');
        this.handleEmitSocket({
            data: message,
            event: 'feedbackNotification',
        });
    }

    handleEmitSocket({ data, event, to }: { data: any; event: any; to?: any }) {
        if (to) {
            this.server.to(to).emit(event, data);
        } else {
            this.server.emit(event, data);
        }
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
