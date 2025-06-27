export declare class NotificationService {
    static sendBookingRequestNotification(propertyOwnerId: string, bookingId: string, guestName: string, propertyTitle: string): Promise<any>;
    static sendBookingConfirmedNotification(guestId: string, bookingId: string, propertyTitle: string, checkInDate: string, checkOutDate: string): Promise<any>;
    static sendBookingCancelledNotification(userId: string, bookingId: string, propertyTitle: string, isOwner: boolean): Promise<any>;
    static sendPaymentReceivedNotification(propertyOwnerId: string, amount: number, bookingId: string, guestName: string): Promise<any>;
    static sendPaymentConfirmedNotification(guestId: string, amount: number, propertyTitle: string): Promise<any>;
    static sendPaymentFailedNotification(userId: string, amount: number, propertyTitle: string, reason: string): Promise<any>;
    static sendNewReviewNotification(propertyOwnerId: string, propertyTitle: string, guestName: string, rating: number): Promise<any>;
    static sendReviewResponseNotification(guestId: string, propertyTitle: string, ownerName: string): Promise<any>;
    static sendSystemNotification(userId: string, title: string, message: string, metadata?: Record<string, any>): Promise<any>;
    static sendBulkNotification(userIds: string[], title: string, message: string, type: 'system' | 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received', metadata?: Record<string, any>): Promise<any>;
}
