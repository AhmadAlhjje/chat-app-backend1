"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const common_1 = require("@nestjs/common");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    constructor(chatService) {
        this.chatService = chatService;
    }
    afterInit() {
        console.log('Initialized WebSocket server');
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        this.handleEvents(client);
    }
    handleDisconnect(client) {
        const rooms = this.server.sockets.adapter.rooms;
        for (const [roomName, room] of rooms.entries()) {
            if (room.has(client.id)) {
                this.chatService.setUserConnectedStatus(client.id, false, roomName);
                this.server.to(roomName).emit('users_list', this.chatService.getUsersInRoom(roomName));
            }
        }
        console.log(`Client disconnected: ${client.id}`);
    }
    handleEvents(client) {
        client.on('join_room', (data) => {
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
        client.on('send_message', (message) => {
            try {
                const savedMessage = this.chatService.sendMessage(message.room, message);
                this.server.to(message.room).emit('new_message', savedMessage);
            }
            catch (error) {
                client.emit('error', { message: 'Failed to send message.', error });
            }
        });
        client.on('disconnecting', () => {
        });
        client.on('leave_room', (data) => {
            const { room } = data;
            this.chatService.leaveRoom(client.id, room);
            client.leave(room);
            this.server
                .to(room)
                .emit('users_list', this.chatService.getUsersInRoom(room));
        });
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __param(0, (0, common_1.Inject)(chat_service_1.ChatService)),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map