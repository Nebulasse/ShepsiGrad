import { Request, Response } from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import paymentService from '../services/paymentService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { PropertyModel } from '../models/Property';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

/**
 * Контроллер для управления бронированиями
 */
class BookingController {
    /**
     * Создание нового бронирования
     */
    async createBooking(req: Request, res: Response) {
        try {
            // Проверяем валидацию
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const userId = req.user?.id;
            const { propertyId, checkIn, checkOut, guests, totalPrice } = req.body;

            // Проверяем доступность объекта на указанные даты
            const isAvailable = await this.checkAvailability(propertyId, checkIn, checkOut);
            if (!isAvailable) {
                return res.status(400).json({ 
                    message: 'Объект недоступен на указанные даты' 
                });
            }

            // Создаем бронирование
            const booking = new Booking({
                propertyId,
                userId,
                checkIn,
                checkOut,
                guests,
                totalPrice,
                status: 'pending', // Изначальный статус - ожидание оплаты
                createdAt: new Date()
            });

            // Сохраняем бронирование
            const savedBooking = await booking.save();

            // Получаем информацию о пользователе и объекте для платежа
            const user = await User.findById(userId);
            const property = await Property.findById(propertyId);

            if (!user || !property) {
                return res.status(404).json({ 
                    message: 'Пользователь или объект не найден' 
                });
            }

            // Отправляем уведомление владельцу объекта
            this.sendBookingNotification(property.ownerId, savedBooking);

            return res.status(201).json({
                id: savedBooking.id,
                propertyId: savedBooking.propertyId,
                checkIn: savedBooking.checkIn,
                checkOut: savedBooking.checkOut,
                guests: savedBooking.guests,
                totalPrice: savedBooking.totalPrice,
                status: savedBooking.status,
                createdAt: savedBooking.createdAt
            });
        } catch (error) {
            logger.error('Ошибка при создании бронирования:', error);
            return res.status(500).json({ 
                message: 'Ошибка при создании бронирования' 
            });
        }
    }

    /**
     * Получение бронирования по ID
     */
    async getBookingById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            // Находим бронирование
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({ 
                    message: 'Бронирование не найдено' 
                });
            }

            // Проверяем права доступа (только владелец бронирования или владелец объекта)
            const property = await Property.findById(booking.propertyId);
            
            if (booking.userId.toString() !== userId && property?.ownerId.toString() !== userId) {
                return res.status(403).json({ 
                    message: 'Нет доступа к данному бронированию' 
                });
            }

            // Получаем дополнительную информацию
            const propertyDetails = await Property.findById(booking.propertyId, 'title address images');
            const userDetails = await User.findById(booking.userId, 'name email avatar');

            // Получаем информацию о платежах
            const payments = await paymentService.getPaymentsByBookingId(id);

            return res.json({
                id: booking.id,
                propertyId: booking.propertyId,
                propertyName: propertyDetails?.title,
                propertyAddress: propertyDetails?.address,
                propertyImage: propertyDetails?.images?.[0],
                userId: booking.userId,
                userName: userDetails?.name,
                userEmail: userDetails?.email,
                userAvatar: userDetails?.avatar,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                createdAt: booking.createdAt,
                payments: payments
            });
        } catch (error) {
            logger.error('Ошибка при получении бронирования:', error);
            return res.status(500).json({ 
                message: 'Ошибка при получении бронирования' 
            });
        }
    }

    /**
     * Получение всех бронирований пользователя
     */
    async getUserBookings(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { status } = req.query;
            
            // Формируем фильтр
            const filter: any = { userId };
            if (status) {
                filter.status = status;
            }

            // Находим бронирования с пагинацией
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // Оптимизированный запрос с использованием агрегации
            const bookings = await Booking.aggregate([
                { $match: filter },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'properties',
                        localField: 'propertyId',
                        foreignField: '_id',
                        as: 'property'
                    }
                },
                { $unwind: '$property' },
                {
                    $project: {
                        id: '$_id',
                        propertyId: 1,
                        propertyName: '$property.title',
                        propertyImage: { $arrayElemAt: ['$property.images', 0] },
                        checkIn: 1,
                        checkOut: 1,
                        guests: 1,
                        totalPrice: 1,
                        status: 1,
                        createdAt: 1
                    }
                }
            ]);

            // Получаем общее количество бронирований
            const total = await Booking.countDocuments(filter);

            return res.json({
                bookings,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Ошибка при получении бронирований пользователя:', error);
            return res.status(500).json({ 
                message: 'Ошибка при получении бронирований' 
            });
        }
    }

    /**
     * Получение всех бронирований объекта недвижимости
     */
    async getPropertyBookings(req: Request, res: Response) {
        try {
            const { propertyId } = req.params;
            const userId = req.user?.id;

            // Проверяем, является ли пользователь владельцем объекта
            const property = await Property.findById(propertyId);
            if (!property) {
                return res.status(404).json({ 
                    message: 'Объект не найден' 
                });
            }

            if (property.ownerId.toString() !== userId) {
                return res.status(403).json({ 
                    message: 'Нет доступа к бронированиям данного объекта' 
                });
            }

            // Находим бронирования с пагинацией
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;
            const { status } = req.query;

            // Формируем фильтр
            const filter: any = { propertyId };
            if (status) {
                filter.status = status;
            }

            // Оптимизированный запрос с использованием агрегации
            const bookings = await Booking.aggregate([
                { $match: filter },
                { $sort: { checkIn: 1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        id: '$_id',
                        userId: 1,
                        userName: '$user.name',
                        userAvatar: '$user.avatar',
                        checkIn: 1,
                        checkOut: 1,
                        guests: 1,
                        totalPrice: 1,
                        status: 1,
                        createdAt: 1
                    }
                }
            ]);

            // Получаем общее количество бронирований
            const total = await Booking.countDocuments(filter);

            return res.json({
                bookings,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            logger.error('Ошибка при получении бронирований объекта:', error);
            return res.status(500).json({ 
                message: 'Ошибка при получении бронирований' 
            });
        }
    }

    /**
     * Отмена бронирования
     */
    async cancelBooking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const { reason } = req.body;

            // Находим бронирование
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({ 
                    message: 'Бронирование не найдено' 
                });
            }

            // Проверяем права доступа (только владелец бронирования может отменить)
            if (booking.userId.toString() !== userId) {
                return res.status(403).json({ 
                    message: 'Нет прав для отмены данного бронирования' 
                });
            }

            // Проверяем, можно ли отменить бронирование
            if (booking.status === 'cancelled') {
                return res.status(400).json({ 
                    message: 'Бронирование уже отменено' 
                });
            }

            if (booking.status === 'completed') {
                return res.status(400).json({ 
                    message: 'Нельзя отменить завершенное бронирование' 
                });
            }

            // Если бронирование было оплачено, выполняем возврат
            if (booking.status === 'confirmed') {
                // Получаем платежи по бронированию
                const payments = await paymentService.getPaymentsByBookingId(id);
                
                if (payments && payments.length > 0) {
                    // Находим последний успешный платеж
                    const lastPayment = payments.find(p => p.status === 'completed');
                    
                    if (lastPayment) {
                        // Выполняем возврат
                        await paymentService.refundPayment({
                            paymentId: lastPayment.id,
                            reason: reason || 'Отмена бронирования пользователем'
                        });
                    }
                }
            }

            // Обновляем статус бронирования
            booking.status = 'cancelled';
            booking.cancellationReason = reason || 'Отмена пользователем';
            booking.cancelledAt = new Date();
            
            await booking.save();

            // Отправляем уведомление владельцу объекта
            const property = await Property.findById(booking.propertyId);
            if (property) {
                this.sendCancellationNotification(property.ownerId, booking);
            }

            return res.json({
                id: booking.id,
                status: booking.status,
                cancelledAt: booking.cancelledAt,
                message: 'Бронирование успешно отменено'
            });
        } catch (error) {
            logger.error('Ошибка при отмене бронирования:', error);
            return res.status(500).json({ 
                message: 'Ошибка при отмене бронирования' 
            });
        }
    }

    /**
     * Подтверждение бронирования (для владельца объекта)
     */
    async confirmBooking(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            // Находим бронирование
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({ 
                    message: 'Бронирование не найдено' 
                });
            }

            // Проверяем права доступа (только владелец объекта может подтвердить)
            const property = await Property.findById(booking.propertyId);
            
            if (!property || property.ownerId.toString() !== userId) {
                return res.status(403).json({ 
                    message: 'Нет прав для подтверждения данного бронирования' 
                });
            }

            // Проверяем текущий статус
            if (booking.status !== 'pending') {
                return res.status(400).json({ 
                    message: `Нельзя подтвердить бронирование в статусе ${booking.status}` 
                });
            }

            // Обновляем статус бронирования
            booking.status = 'awaiting_payment';
            booking.confirmedAt = new Date();
            
            await booking.save();

            // Отправляем уведомление арендатору
            this.sendBookingConfirmationNotification(booking.userId, booking);

            return res.json({
                id: booking.id,
                status: booking.status,
                confirmedAt: booking.confirmedAt,
                message: 'Бронирование подтверждено и ожидает оплаты'
            });
        } catch (error) {
            logger.error('Ошибка при подтверждении бронирования:', error);
            return res.status(500).json({ 
                message: 'Ошибка при подтверждении бронирования' 
            });
        }
    }

    /**
     * Обработка успешной оплаты бронирования
     */
    async handlePaymentSuccess(req: Request, res: Response) {
        try {
            const { bookingId, paymentId } = req.body;

            // Находим бронирование
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ 
                    message: 'Бронирование не найдено' 
                });
            }

            // Проверяем текущий статус
            if (booking.status !== 'awaiting_payment' && booking.status !== 'pending') {
                return res.status(400).json({ 
                    message: `Неверный статус бронирования для оплаты: ${booking.status}` 
                });
            }

            // Обрабатываем успешный платеж
            await paymentService.processSuccessfulPayment({
                paymentId,
                gatewayReference: req.body.gatewayReference || paymentId
            });

            // Обновляем статус бронирования
            booking.status = 'confirmed';
            booking.paidAt = new Date();
            booking.paymentId = paymentId;
            
            await booking.save();

            // Отправляем уведомления
            this.sendPaymentSuccessNotification(booking.userId, booking);
            
            const property = await Property.findById(booking.propertyId);
            if (property) {
                this.sendPaymentSuccessNotificationToOwner(property.ownerId, booking);
            }

            return res.json({
                id: booking.id,
                status: booking.status,
                paidAt: booking.paidAt,
                message: 'Оплата успешно обработана, бронирование подтверждено'
            });
        } catch (error) {
            logger.error('Ошибка при обработке успешной оплаты:', error);
            return res.status(500).json({ 
                message: 'Ошибка при обработке оплаты' 
            });
        }
    }

    /**
     * Обработка неуспешной оплаты бронирования
     */
    async handlePaymentFailure(req: Request, res: Response) {
        try {
            const { bookingId, paymentId } = req.body;

            // Находим бронирование
            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).json({ 
                    message: 'Бронирование не найдено' 
                });
            }

            // Обрабатываем неуспешный платеж
            await paymentService.processFailedPayment(paymentId);

            return res.json({
                id: booking.id,
                status: booking.status,
                message: 'Информация о неуспешной оплате сохранена'
            });
        } catch (error) {
            logger.error('Ошибка при обработке неуспешной оплаты:', error);
            return res.status(500).json({ 
                message: 'Ошибка при обработке информации о платеже' 
            });
        }
    }

    /**
     * Проверка доступности объекта на указанные даты
     * @private
     */
    private async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> {
        // Проверяем существующие бронирования на эти даты
        const overlappingBookings = await Booking.find({
            propertyId,
            status: { $nin: ['cancelled'] },
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
            ]
        }).countDocuments();

        return overlappingBookings === 0;
    }

    /**
     * Отправка уведомления о новом бронировании владельцу объекта
     * @private
     */
    private async sendBookingNotification(ownerId: string, booking: any) {
        // Здесь будет код для отправки уведомления
        // В реальном приложении использовать сервис уведомлений
        logger.info(`Отправка уведомления о новом бронировании владельцу ${ownerId}`);
    }

    /**
     * Отправка уведомления об отмене бронирования владельцу объекта
     * @private
     */
    private async sendCancellationNotification(ownerId: string, booking: any) {
        // Здесь будет код для отправки уведомления
        logger.info(`Отправка уведомления об отмене бронирования владельцу ${ownerId}`);
    }

    /**
     * Отправка уведомления о подтверждении бронирования арендатору
     * @private
     */
    private async sendBookingConfirmationNotification(userId: string, booking: any) {
        // Здесь будет код для отправки уведомления
        logger.info(`Отправка уведомления о подтверждении бронирования пользователю ${userId}`);
    }

    /**
     * Отправка уведомления об успешной оплате арендатору
     * @private
     */
    private async sendPaymentSuccessNotification(userId: string, booking: any) {
        // Здесь будет код для отправки уведомления
        logger.info(`Отправка уведомления об успешной оплате пользователю ${userId}`);
    }

    /**
     * Отправка уведомления об успешной оплате владельцу объекта
     * @private
     */
    private async sendPaymentSuccessNotificationToOwner(ownerId: string, booking: any) {
        // Здесь будет код для отправки уведомления
        logger.info(`Отправка уведомления об успешной оплате владельцу ${ownerId}`);
    }
}

export default new BookingController(); 