import { Server as HttpServer } from 'http';
interface SocketUser {
    userId: string;
    socketId: string;
    appType: 'tenant' | 'landlord';
}
export declare class SocketService {
    private io;
    private connectedUsers;
    constructor(server: HttpServer);
    private setupSocketHandlers;
    sendNotification(userId: string, type: string, content: any): void;
    sendPrivateMessage(from: string, to: string, message: string, propertyId?: string): void;
    broadcastMessage(message: string, appType?: 'tenant' | 'landlord'): void;
    getConnectedUsers(): SocketUser[];
}
export {};
