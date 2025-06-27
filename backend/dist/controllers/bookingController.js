"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Booking_1 = require("../models/Booking");
const paymentService_1 = __importDefault(require("../services/paymentService"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const express_validator_1 = require("express-validator");
/**
 * Контроллер для управления бронированиями
 */
class BookingController {
    /**
     * Создание нового бронирования
     */
    async createBooking(req, res) {
        var _a;
        try {
            // Проверяем валидацию
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { propertyId, checkIn, checkOut, guests, totalPrice } = req.body;
            // Проверяем доступность объекта на указанные даты
            const isAvailable = await this.checkAvailability(propertyId, checkIn, checkOut);
            if (!isAvailable) {
                return res.status(400).json({
                    message: 'Объект недоступен на указанные даты'
                });
            }
            // Создаем бронирование
            const booking = new Booking_1.Booking({
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
            const user = await User_1.User.findById(userId);
            const property = await Property_1.Property.findById(propertyId);
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
        }
        catch (error) {
            logger_1.logger.error('Ошибка при создании бронирования:', error);
            return res.status(500).json({
                message: 'Ошибка при создании бронирования'
            });
        }
    }
    /**
     * Получение бронирования по ID
     */
    async getBookingById(req, res) {
        var _a, _b;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Находим бронирование
            const booking = await Booking_1.Booking.findById(id);
            if (!booking) {
                return res.status(404).json({
                    message: 'Бронирование не найдено'
                });
            }
            // Проверяем права доступа (только владелец бронирования или владелец объекта)
            const property = await Property_1.Property.findById(booking.propertyId);
            if (booking.userId.toString() !== userId && (property === null || property === void 0 ? void 0 : property.ownerId.toString()) !== userId) {
                return res.status(403).json({
                    message: 'Нет доступа к данному бронированию'
                });
            }
            // Получаем дополнительную информацию
            const propertyDetails = await Property_1.Property.findById(booking.propertyId, 'title address images');
            const userDetails = await User_1.User.findById(booking.userId, 'name email avatar');
            // Получаем информацию о платежах
            const payments = await paymentService_1.default.getPaymentsByBookingId(id);
            return res.json({
                id: booking.id,
                propertyId: booking.propertyId,
                propertyName: propertyDetails === null || propertyDetails === void 0 ? void 0 : propertyDetails.title,
                propertyAddress: propertyDetails === null || propertyDetails === void 0 ? void 0 : propertyDetails.address,
                propertyImage: (_b = propertyDetails === null || propertyDetails === void 0 ? void 0 : propertyDetails.images) === null || _b === void 0 ? void 0 : _b[0],
                userId: booking.userId,
                userName: userDetails === null || userDetails === void 0 ? void 0 : userDetails.name,
                userEmail: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
                userAvatar: userDetails === null || userDetails === void 0 ? void 0 : userDetails.avatar,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                guests: booking.guests,
                totalPrice: booking.totalPrice,
                status: booking.status,
                createdAt: booking.createdAt,
                payments: payments
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при получении бронирования:', error);
            return res.status(500).json({
                message: 'Ошибка при получении бронирования'
            });
        }
    }
    /**
     * Получение всех бронирований пользователя
     */
    async getUserBookings(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { status } = req.query;
            // Формируем фильтр
            const filter = { userId };
            if (status) {
                filter.status = status;
            }
            // Находим бронирования с пагинацией
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            // Оптимизированный запрос с использованием агрегации
            const bookings = await Booking_1.Booking.aggregate([
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
            const total = await Booking_1.Booking.countDocuments(filter);
            return res.json({
                bookings,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при получении бронирований пользователя:', error);
            return res.status(500).json({
                message: 'Ошибка при получении бронирований'
            });
        }
    }
    /**
     * Получение всех бронирований объекта недвижимости
     */
    async getPropertyBookings(req, res) {
        var _a;
        try {
            const { propertyId } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Проверяем, является ли пользователь владельцем объекта
            const property = await Property_1.Property.findById(propertyId);
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const { status } = req.query;
            // Формируем фильтр
            const filter = { propertyId };
            if (status) {
                filter.status = status;
            }
            // Оптимизированный запрос с использованием агрегации
            const bookings = await Booking_1.Booking.aggregate([
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
            const total = await Booking_1.Booking.countDocuments(filter);
            return res.json({
                bookings,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при получении бронирований объекта:', error);
            return res.status(500).json({
                message: 'Ошибка при получении бронирований'
            });
        }
    }
    /**
     * Отмена бронирования
     */
    async cancelBooking(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { reason } = req.body;
            // Находим бронирование
            const booking = await Booking_1.Booking.findById(id);
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
                const payments = await paymentService_1.default.getPaymentsByBookingId(id);
                if (payments && payments.length > 0) {
                    // Находим последний успешный платеж
                    const lastPayment = payments.find(p => p.status === 'completed');
                    if (lastPayment) {
                        // Выполняем возврат
                        await paymentService_1.default.refundPayment({
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
            const property = await Property_1.Property.findById(booking.propertyId);
            if (property) {
                this.sendCancellationNotification(property.ownerId, booking);
            }
            return res.json({
                id: booking.id,
                status: booking.status,
                cancelledAt: booking.cancelledAt,
                message: 'Бронирование успешно отменено'
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при отмене бронирования:', error);
            return res.status(500).json({
                message: 'Ошибка при отмене бронирования'
            });
        }
    }
    /**
     * Подтверждение бронирования (для владельца объекта)
     */
    async confirmBooking(req, res) {
        var _a;
        try {
            const { id } = req.params;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // Находим бронирование
            const booking = await Booking_1.Booking.findById(id);
            if (!booking) {
                return res.status(404).json({
                    message: 'Бронирование не найдено'
                });
            }
            // Проверяем права доступа (только владелец объекта может подтвердить)
            const property = await Property_1.Property.findById(booking.propertyId);
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
        }
        catch (error) {
            logger_1.logger.error('Ошибка при подтверждении бронирования:', error);
            return res.status(500).json({
                message: 'Ошибка при подтверждении бронирования'
            });
        }
    }
    /**
     * Обработка успешной оплаты бронирования
     */
    async handlePaymentSuccess(req, res) {
        try {
            const { bookingId, paymentId } = req.body;
            // Находим бронирование
            const booking = await Booking_1.Booking.findById(bookingId);
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
            await paymentService_1.default.processSuccessfulPayment({
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
            const property = await Property_1.Property.findById(booking.propertyId);
            if (property) {
                this.sendPaymentSuccessNotificationToOwner(property.ownerId, booking);
            }
            return res.json({
                id: booking.id,
                status: booking.status,
                paidAt: booking.paidAt,
                message: 'Оплата успешно обработана, бронирование подтверждено'
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при обработке успешной оплаты:', error);
            return res.status(500).json({
                message: 'Ошибка при обработке оплаты'
            });
        }
    }
    /**
     * Обработка неуспешной оплаты бронирования
     */
    async handlePaymentFailure(req, res) {
        try {
            const { bookingId, paymentId } = req.body;
            // Находим бронирование
            const booking = await Booking_1.Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({
                    message: 'Бронирование не найдено'
                });
            }
            // Обрабатываем неуспешный платеж
            await paymentService_1.default.processFailedPayment(paymentId);
            return res.json({
                id: booking.id,
                status: booking.status,
                message: 'Информация о неуспешной оплате сохранена'
            });
        }
        catch (error) {
            logger_1.logger.error('Ошибка при обработке неуспешной оплаты:', error);
            return res.status(500).json({
                message: 'Ошибка при обработке информации о платеже'
            });
        }
    }
    /**
     * Проверка доступности объекта на указанные даты
     * @private
     */
    async checkAvailability(propertyId, checkIn, checkOut) {
        // Проверяем существующие бронирования на эти даты
        const overlappingBookings = await Booking_1.Booking.find({
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
    async sendBookingNotification(ownerId, booking) {
        // Здесь будет код для отправки уведомления
        // В реальном приложении использовать сервис уведомлений
        logger_1.logger.info(`Отправка уведомления о новом бронировании владельцу ${ownerId}`);
    }
    /**
     * Отправка уведомления об отмене бронирования владельцу объекта
     * @private
     */
    async sendCancellationNotification(ownerId, booking) {
        // Здесь будет код для отправки уведомления
        logger_1.logger.info(`Отправка уведомления об отмене бронирования владельцу ${ownerId}`);
    }
    /**
     * Отправка уведомления о подтверждении бронирования арендатору
     * @private
     */
    async sendBookingConfirmationNotification(userId, booking) {
        // Здесь будет код для отправки уведомления
        logger_1.logger.info(`Отправка уведомления о подтверждении бронирования пользователю ${userId}`);
    }
    /**
     * Отправка уведомления об успешной оплате арендатору
     * @private
     */
    async sendPaymentSuccessNotification(userId, booking) {
        // Здесь будет код для отправки уведомления
        logger_1.logger.info(`Отправка уведомления об успешной оплате пользователю ${userId}`);
    }
    /**
     * Отправка уведомления об успешной оплате владельцу объекта
     * @private
     */
    async sendPaymentSuccessNotificationToOwner(ownerId, booking) {
        // Здесь будет код для отправки уведомления
        logger_1.logger.info(`Отправка уведомления об успешной оплате владельцу ${ownerId}`);
    }
}
exports.default = new BookingController();
