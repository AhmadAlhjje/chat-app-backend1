"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
let ChatService = class ChatService {
    rooms = new Map();
    joinRoom(socketId, username, room) {
        if (!this.rooms.has(room)) {
            this.rooms.set(room, { users: new Map(), messages: [] });
        }
        const roomData = this.rooms.get(room);
        if (!roomData)
            throw new Error('Failed to retrieve room');
        for (const [key, user] of roomData.users.entries()) {
            if (user.username === username) {
                roomData.users.delete(key);
            }
        }
        roomData.users.set(socketId, { socketId, username, connected: true });
        return {
            users: Array.from(roomData.users.values()),
            messages: roomData.messages,
        };
    }
    setUserConnectedStatus(socketId, connected, room) {
        const roomData = this.rooms.get(room);
        if (!roomData)
            return;
        const user = roomData.users.get(socketId);
        if (user) {
            user.connected = connected;
        }
    }
    canUserJoin(socketId, username, room) {
        const roomData = this.rooms.get(room);
        if (!roomData) {
            return { allowed: true };
        }
        const existingUser = Array.from(roomData.users.values()).find((user) => user.username === username);
        if (existingUser) {
            return {
                allowed: false,
                message: 'الاسم مستخدم، يرجى استخدام اسم آخر',
            };
        }
        return { allowed: true };
    }
    leaveRoom(socketId, room) {
        const roomData = this.rooms.get(room);
        if (roomData) {
            roomData.users.delete(socketId);
        }
    }
    sendMessage(room, message) {
        const roomData = this.rooms.get(room);
        if (!roomData) {
            throw new Error(`Room "${room}" does not exist.`);
        }
        roomData.messages.push(message);
        return message;
    }
    getUsersInRoom(room) {
        const roomData = this.rooms.get(room);
        return roomData ? Array.from(roomData.users.values()) : [];
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)()
], ChatService);
//# sourceMappingURL=chat.service.js.map