import { NotificationModel } from '../models/Notification';

export class NotificationService {
    // Уведомления о бронированиях
    static async sendBookingRequestNotification(propertyOwnerId: string, bookingId: string, guestName: string, propertyTitle: string) {
        return NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'booking_request',
            title: 'Новый запрос на бронирование',
            message: `${guestName} хочет забронировать ваше жилье "${propertyTitle}"`,
            metadata: { booking_id: bookingId, property_title: propertyTitle }
        });
    }

    static async sendBookingConfirmedNotification(guestId: string, bookingId: string, propertyTitle: string, checkInDate: string, checkOutDate: string) {
        return NotificationModel.create({
            user_id: guestId,
            type: 'booking_confirmed',
            title: 'Бронирование подтверждено',
            message: `Ваше бронирование в "${propertyTitle}" с ${checkInDate} по ${checkOutDate} было подтверждено`,
            metadata: { booking_id: bookingId, property_title: propertyTitle, check_in_date: checkInDate, check_out_date: checkOutDate }
        });
    }

    static async sendBookingCancelledNotification(userId: string, bookingId: string, propertyTitle: string, isOwner: boolean) {
        return NotificationModel.create({
            user_id: userId,
            type: 'booking_cancelled',
            title: 'Бронирование отменено',
            message: isOwner 
                ? `Вы отменили бронирование в "${propertyTitle}"`
                : `Владелец отменил ваше бронирование в "${propertyTitle}"`,
            metadata: { booking_id: bookingId, property_title: propertyTitle }
        });
    }

    // Уведомления о платежах
    static async sendPaymentReceivedNotification(propertyOwnerId: string, amount: number, bookingId: string, guestName: string) {
        return NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'payment_received',
            title: 'Получен платеж',
            message: `Вы получили платеж в размере ${amount} руб. от ${guestName}`,
            metadata: { booking_id: bookingId, amount, guest_name: guestName }
        });
    }

    static async sendPaymentConfirmedNotification(guestId: string, amount: number, propertyTitle: string) {
        return NotificationModel.create({
            user_id: guestId,
            type: 'payment_received',
            title: 'Платеж подтвержден',
            message: `Ваш платеж в размере ${amount} руб. за "${propertyTitle}" успешно обработан`,
            metadata: { property_title: propertyTitle, amount }
        });
    }

    static async sendPaymentFailedNotification(userId: string, amount: number, propertyTitle: string, reason: string) {
        return NotificationModel.create({
            user_id: userId,
            type: 'system',
            title: 'Ошибка платежа',
            message: `Платеж в размере ${amount} руб. за "${propertyTitle}" не прошел. Причина: ${reason}`,
            metadata: { property_title: propertyTitle, amount, reason }
        });
    }

    // Уведомления о рейтингах и отзывах
    static async sendNewReviewNotification(propertyOwnerId: string, propertyTitle: string, guestName: string, rating: number) {
        return NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'system',
            title: 'Новый отзыв о вашем жилье',
            message: `${guestName} оставил отзыв о "${propertyTitle}" с оценкой ${rating}/5`,
            metadata: { property_title: propertyTitle, guest_name: guestName, rating }
        });
    }

    static async sendReviewResponseNotification(guestId: string, propertyTitle: string, ownerName: string) {
        return NotificationModel.create({
            user_id: guestId,
            type: 'system',
            title: 'Ответ на ваш отзыв',
            message: `Владелец ${ownerName} ответил на ваш отзыв о "${propertyTitle}"`,
            metadata: { property_title: propertyTitle, owner_name: ownerName }
        });
    }

    // Системные уведомления
    static async sendSystemNotification(userId: string, title: string, message: string, metadata?: Record<string, any>) {
        return NotificationModel.create({
            user_id: userId,
            type: 'system',
            title,
            message,
            metadata
        });
    }

    // Отправка уведомления нескольким пользователям
    static async sendBulkNotification(userIds: string[], title: string, message: string, type: 'system' | 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received', metadata?: Record<string, any>) {
        const promises = userIds.map(userId => 
            NotificationModel.create({
                user_id: userId,
                type,
                title,
                message,
                metadata
            })
        );
        
        return Promise.all(promises);
    }
} 