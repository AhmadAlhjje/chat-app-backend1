import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Inject } from '@nestjs/common';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(@Inject(ChatService) private readonly chatService: ChatService) {}

  afterInit() {
    console.log('Initialized WebSocket server');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.handleEvents(client);
  }

  handleDisconnect(client: Socket) {
  const rooms = this.server.sockets.adapter.rooms;

  for (const [roomName, room] of rooms.entries()) {
    if (room.has(client.id)) {
      this.chatService.setUserConnectedStatus(client.id, false, roomName);
      this.server.to(roomName).emit('users_list', this.chatService.getUsersInRoom(roomName));
    }
  }

  console.log(`Client disconnected: ${client.id}`);
}

  // استقبال الأحداث
  handleEvents(client: Socket) {
    client.on('join_room', (data: JoinRoomDto) => {
      const { username, room } = data;
      const users = this.chatService.joinRoom(client.id, username, room);

      client.join(room);

      client.emit('users_list', users.users);
      client.emit('previous_messages', users.messages);

      client.to(room).emit('user_joined', { username, socketId: client.id });
      this.server
        .to(room)
        .emit('users_list', this.chatService.getUsersInRoom(room));
    });

    client.on('send_message', (message: SendMessageDto) => {
      try {
        const savedMessage = this.chatService.sendMessage(
          message.room,
          message,
        );
        this.server.to(message.room).emit('new_message', savedMessage);
      } catch (error) {
        client.emit('error', { message: 'Failed to send message.', error });
      }
    });

    client.on('disconnecting', () => {
      // سيتم التعامل معه في handleDisconnect
    });
    client.on('leave_room', (data: LeaveRoomDto) => {
      const { room } = data;
      this.chatService.leaveRoom(client.id, room);
      client.leave(room);

      // إشعار باقي المستخدمين
      this.server
        .to(room)
        .emit('users_list', this.chatService.getUsersInRoom(room));
    });
  }
}
