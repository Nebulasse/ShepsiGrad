import { Request, Response } from 'express';
/**
 * Контроллер для управления бронированиями
 */
declare class BookingController {
    /**
     * Создание нового бронирования
     */
    createBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получение бронирования по ID
     */
    getBookingById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получение всех бронирований пользователя
     */
    getUserBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получение всех бронирований объекта недвижимости
     */
    getPropertyBookings(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Отмена бронирования
     */
    cancelBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Подтверждение бронирования (для владельца объекта)
     */
    confirmBooking(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обработка успешной оплаты бронирования
     */
    handlePaymentSuccess(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Обработка неуспешной оплаты бронирования
     */
    handlePaymentFailure(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Проверка доступности объекта на указанные даты
     * @private
     */
    private checkAvailability;
    /**
     * Отправка уведомления о новом бронировании владельцу объекта
     * @private
     */
    private sendBookingNotification;
    /**
     * Отправка уведомления об отмене бронирования владельцу объекта
     * @private
     */
    private sendCancellationNotification;
    /**
     * Отправка уведомления о подтверждении бронирования арендатору
     * @private
     */
    private sendBookingConfirmationNotification;
    /**
     * Отправка уведомления об успешной оплате арендатору
     * @private
     */
    private sendPaymentSuccessNotification;
    /**
     * Отправка уведомления об успешной оплате владельцу объекта
     * @private
     */
    private sendPaymentSuccessNotificationToOwner;
}
declare const _default: BookingController;
export default _default;
