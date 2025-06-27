import { User } from './User';
export declare enum NotificationType {
    BOOKING_REQUEST = "booking_request",
    BOOKING_CONFIRMED = "booking_confirmed",
    BOOKING_CANCELLED = "booking_cancelled",
    PAYMENT_RECEIVED = "payment_received",
    NEW_MESSAGE = "new_message",
    NEW_REVIEW = "new_review",
    SYSTEM = "system"
}
export declare class Notification {
    id: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    readAt?: Date;
    actionUrl?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    relatedEntityId?: string;
    relatedEntityType?: string;
}
