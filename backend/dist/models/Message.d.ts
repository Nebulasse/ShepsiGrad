import { User } from './User';
import { Chat } from './Chat';
export declare enum MessageStatus {
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}
export declare enum MessageType {
    TEXT = "text",
    IMAGE = "image",
    FILE = "file",
    SYSTEM = "system"
}
export declare class Message {
    id: string;
    content: string;
    type: MessageType;
    status: MessageStatus;
    isRead: boolean;
    createdAt: Date;
    attachmentUrl?: string;
    chat: Chat;
    chatId: string;
    sender: User;
    senderId: string;
}
