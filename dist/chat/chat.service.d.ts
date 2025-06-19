interface User {
    socketId: string;
    username: string;
    connected: boolean;
}
export declare class ChatService {
    private rooms;
    joinRoom(socketId: string, username: string, room: string): {
        users: User[];
        messages: any[];
    };
    setUserConnectedStatus(socketId: string, connected: boolean, room: string): void;
    canUserJoin(socketId: string, username: string, room: string): {
        allowed: boolean;
        message?: string;
    };
    leaveRoom(socketId: string, room: string): void;
    sendMessage(room: string, message: any): any;
    getUsersInRoom(room: string): User[];
}
export {};
