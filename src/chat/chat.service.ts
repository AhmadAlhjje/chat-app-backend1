import { Injectable } from '@nestjs/common';

interface User {
  socketId: string;
  username: string;
  connected: boolean;
}

@Injectable()
export class ChatService {
  private rooms: Map<string, { users: Map<string, User>; messages: any[] }> =
    new Map();

  joinRoom(socketId: string, username: string, room: string) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, { users: new Map(), messages: [] });
    }

    const roomData = this.rooms.get(room);
    if (!roomData) throw new Error('Failed to retrieve room');

    // ✅ حذف جميع المستخدمين بنفس الاسم (حتى لو كان هناك أكثر من واحد)
    for (const [key, user] of roomData.users.entries()) {
      if (user.username === username) {
        roomData.users.delete(key);
      }
    }

    // ✅ إضافة المستخدم الجديد
    roomData.users.set(socketId, { socketId, username, connected: true });

    return {
      users: Array.from(roomData.users.values()),
      messages: roomData.messages,
    };
  }

  setUserConnectedStatus(socketId: string, connected: boolean, room: string) {
    const roomData = this.rooms.get(room);
    if (!roomData) return;

    const user = roomData.users.get(socketId);
    if (user) {
      user.connected = connected;
    }
  }

  canUserJoin(
    socketId: string,
    username: string,
    room: string,
  ): { allowed: boolean; message?: string } {
    const roomData = this.rooms.get(room);

    if (!roomData) {
      return { allowed: true }; // الغرفة فارغة، يمكن الدخول
    }

    const existingUser = Array.from(roomData.users.values()).find(
      (user) => user.username === username,
    );

    if (existingUser) {
      return {
        allowed: false,
        message: 'الاسم مستخدم، يرجى استخدام اسم آخر',
      };
    }

    return { allowed: true };
  }

  leaveRoom(socketId: string, room: string) {
    const roomData = this.rooms.get(room);
    if (roomData) {
      roomData.users.delete(socketId);
    }
  }

  sendMessage(room: string, message: any) {
    const roomData = this.rooms.get(room);
    if (!roomData) {
      throw new Error(`Room "${room}" does not exist.`);
    }

    roomData.messages.push(message);
    return message;
  }

  getUsersInRoom(room: string) {
    const roomData = this.rooms.get(room);
    return roomData ? Array.from(roomData.users.values()) : [];
  }
}
