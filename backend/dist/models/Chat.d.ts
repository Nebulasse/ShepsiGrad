import { User } from './User';
import { Property } from './Property';
import { Message } from './Message';
export declare enum ChatStatus {
    ACTIVE = "active",
    ARCHIVED = "archived",
    DELETED = "deleted"
}
export declare class Chat {
    id: string;
    title?: string;
    status: ChatStatus;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt?: Date;
    user: User;
    userId: string;
    landlord: User;
    landlordId: string;
    property?: Property;
    propertyId?: string;
    messages: Message[];
}
