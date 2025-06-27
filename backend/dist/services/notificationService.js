"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const Notification_1 = require("../models/Notification");
class NotificationService {
    // Уведомления о бронированиях
    static async sendBookingRequestNotification(propertyOwnerId, bookingId, guestName, propertyTitle) {
        return Notification_1.NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'booking_request',
            title: 'Новый запрос на бронирование',
            message: `${guestName} хочет забронировать ваше жилье "${propertyTitle}"`,
            metadata: { booking_id: bookingId, property_title: propertyTitle }
        });
    }
    static async sendBookingConfirmedNotification(guestId, bookingId, propertyTitle, checkInDate, checkOutDate) {
        return Notification_1.NotificationModel.create({
            user_id: guestId,
            type: 'booking_confirmed',
            title: 'Бронирование подтверждено',
            message: `Ваше бронирование в "${propertyTitle}" с ${checkInDate} по ${checkOutDate} было подтверждено`,
            metadata: { booking_id: bookingId, property_title: propertyTitle, check_in_date: checkInDate, check_out_date: checkOutDate }
        });
    }
    static async sendBookingCancelledNotification(userId, bookingId, propertyTitle, isOwner) {
        return Notification_1.NotificationModel.create({
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
    static async sendPaymentReceivedNotification(propertyOwnerId, amount, bookingId, guestName) {
        return Notification_1.NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'payment_received',
            title: 'Получен платеж',
            message: `Вы получили платеж в размере ${amount} руб. от ${guestName}`,
            metadata: { booking_id: bookingId, amount, guest_name: guestName }
        });
    }
    static async sendPaymentConfirmedNotification(guestId, amount, propertyTitle) {
        return Notification_1.NotificationModel.create({
            user_id: guestId,
            type: 'payment_received',
            title: 'Платеж подтвержден',
            message: `Ваш платеж в размере ${amount} руб. за "${propertyTitle}" успешно обработан`,
            metadata: { property_title: propertyTitle, amount }
        });
    }
    static async sendPaymentFailedNotification(userId, amount, propertyTitle, reason) {
        return Notification_1.NotificationModel.create({
            user_id: userId,
            type: 'system',
            title: 'Ошибка платежа',
            message: `Платеж в размере ${amount} руб. за "${propertyTitle}" не прошел. Причина: ${reason}`,
            metadata: { property_title: propertyTitle, amount, reason }
        });
    }
    // Уведомления о рейтингах и отзывах
    static async sendNewReviewNotification(propertyOwnerId, propertyTitle, guestName, rating) {
        return Notification_1.NotificationModel.create({
            user_id: propertyOwnerId,
            type: 'system',
            title: 'Новый отзыв о вашем жилье',
            message: `${guestName} оставил отзыв о "${propertyTitle}" с оценкой ${rating}/5`,
            metadata: { property_title: propertyTitle, guest_name: guestName, rating }
        });
    }
    static async sendReviewResponseNotification(guestId, propertyTitle, ownerName) {
        return Notification_1.NotificationModel.create({
            user_id: guestId,
            type: 'system',
            title: 'Ответ на ваш отзыв',
            message: `Владелец ${ownerName} ответил на ваш отзыв о "${propertyTitle}"`,
            metadata: { property_title: propertyTitle, owner_name: ownerName }
        });
    }
    // Системные уведомления
    static async sendSystemNotification(userId, title, message, metadata) {
        return Notification_1.NotificationModel.create({
            user_id: userId,
            type: 'system',
            title,
            message,
            metadata
        });
    }
    // Отправка уведомления нескольким пользователям
    static async sendBulkNotification(userIds, title, message, type, metadata) {
        const promises = userIds.map(userId => Notification_1.NotificationModel.create({
            user_id: userId,
            type,
            title,
            message,
            metadata
        }));
        return Promise.all(promises);
    }
}
exports.NotificationService = NotificationService;
