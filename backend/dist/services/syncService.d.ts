import mongoose from 'mongoose';
export declare enum SyncChannel {
    PROPERTY_UPDATE = "PROPERTY_UPDATE",
    CHAT_MESSAGE = "CHAT_MESSAGE",
    NOTIFICATION = "NOTIFICATION",
    BOOKING_UPDATE = "BOOKING_UPDATE",
    USER_UPDATE = "USER_UPDATE",
    FAVORITE_UPDATE = "FAVORITE_UPDATE"
}
export interface SyncEvent<T = any> {
    type: string;
    payload: T;
    timestamp: number;
    source: string;
    targetApps?: string[];
}
export interface DocumentSyncPayload {
    documentId: string;
    document: any;
    operationType: string;
}
export interface ChatMessagePayload {
    chatId: string;
    message: any;
}
export interface NotificationPayload {
    userId?: string;
    [key: string]: any;
}
declare class SyncService {
    private pubsub;
    private applicationId;
    constructor();
    publish<T>(channel: SyncChannel, type: string, payload: T, targetApps?: string[]): Promise<void>;
    subscribe<T>(channel: SyncChannel, callback: (event: SyncEvent<T>) => void): () => void;
    setupModelSync<T extends mongoose.Document>(model: mongoose.Model<T>, channel: SyncChannel): Promise<void>;
}
export declare const syncService: SyncService;
export {};
