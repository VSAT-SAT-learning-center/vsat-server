import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({ namespace: '/notifications', cors: true })
  export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private connectedUsers: { [userId: string]: string } = {};
  
    afterInit(server: Server) {
      console.log('WebSocket Server Initialized');
    }
  
    handleConnection(socket: Socket) {
      const userId = socket.handshake.query.userId as string;
      if (userId) {
        this.connectedUsers[userId] = socket.id;
        console.log(`User connected: ${userId} with socket ID ${socket.id}`);
      }
    }
  
    handleDisconnect(socket: Socket) {
      const userId = Object.keys(this.connectedUsers).find(
        (key) => this.connectedUsers[key] === socket.id,
      );
      if (userId) {
        delete this.connectedUsers[userId];
        console.log(`User disconnected: ${userId}`);
      }
    }
  
    // Send notification to a specific user by userId
    sendNotificationToUser(userId: string, message: string) {
      const socketId = this.connectedUsers[userId];
      if (socketId) {
        this.server.to(socketId).emit('notification', message);
      }
    }
  }
  