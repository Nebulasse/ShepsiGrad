import { Request, Response } from 'express';
import { z } from 'zod';
import { Booking } from '../models/Booking';
import paymentService from '../services/paymentService';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Контроллер для работы с бронированиями
 */
export const bookingController = {
    /**
     * Создание нового бронирования
     */
    async createBooking(req: AuthenticatedRequest, res: Response) {
        try {
            const { user_id } = req.user;
            const bookingData = {
                ...req.body,
                user_id,
                status: 'pending', // Начальный статус - ожидание оплаты
                created_at: new Date(),
            };

            // Создаем бронирование в базе данных
            const booking = await Booking.create(bookingData);

            res.status(201).json({
                success: true,
                id: booking.id,
                message: 'Бронирование успешно создано',
            });
        } catch (error) {
            console.error('Error creating booking:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании бронирования',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Получение бронирования по ID
     */
    async getBookingById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            res.status(200).json({
                success: true,
                booking,
            });
        } catch (error) {
            console.error('Error fetching booking:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении бронирования',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Получение всех бронирований пользователя
     */
    async getUserBookings(req: AuthenticatedRequest, res: Response) {
        try {
            const { user_id } = req.user;
            const bookings = await Booking.findByUserId(user_id);

            res.status(200).json({
                success: true,
                bookings,
            });
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении бронирований пользователя',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Получение всех бронирований для объекта недвижимости
     */
    async getPropertyBookings(req: Request, res: Response) {
        try {
            const { property_id } = req.params;
            const bookings = await Booking.findByPropertyId(property_id);

            res.status(200).json({
                success: true,
                bookings,
            });
        } catch (error) {
            console.error('Error fetching property bookings:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении бронирований объекта',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Отмена бронирования
     */
    async cancelBooking(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { user_id } = req.user;

            // Получаем бронирование
            const booking = await Booking.findById(id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            // Проверяем, принадлежит ли бронирование текущему пользователю
            if (booking.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для отмены этого бронирования',
                });
            }

            // Проверяем, можно ли отменить бронирование
            if (booking.status === 'cancelled') {
                return res.status(400).json({
                    success: false,
                    message: 'Бронирование уже отменено',
                });
            }

            if (booking.status === 'completed') {
                return res.status(400).json({
                    success: false,
                    message: 'Невозможно отменить завершенное бронирование',
                });
            }

            // Если бронирование было оплачено, выполняем возврат средств
            if (booking.status === 'confirmed' && booking.payment_id) {
                try {
                    await paymentService.refundPayment(
                        booking.payment_id,
                        booking.total_price,
                        `Возврат средств за бронирование #${booking.id}`
                    );
                } catch (refundError) {
                    console.error('Error refunding payment:', refundError);
                    // Продолжаем отмену бронирования, но логируем ошибку
                }
            }

            // Обновляем статус бронирования
            const updatedBooking = await Booking.update(id, {
                status: 'cancelled',
                cancelled_at: new Date(),
            });

            res.status(200).json({
                success: true,
                message: 'Бронирование успешно отменено',
                booking: updatedBooking,
            });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при отмене бронирования',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Создание платежа для бронирования
     */
    async createPayment(req: AuthenticatedRequest, res: Response) {
        try {
            const { booking_id } = req.body;
            const { user_id } = req.user;

            // Получаем бронирование
            const booking = await Booking.findById(booking_id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            // Проверяем, принадлежит ли бронирование текущему пользователю
            if (booking.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для оплаты этого бронирования',
                });
            }

            // Проверяем статус бронирования
            if (booking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Невозможно оплатить бронирование в статусе "${booking.status}"`,
                });
            }

            // Создаем платеж
            const payment = await paymentService.createPayment(
                booking.total_price,
                `Оплата бронирования #${booking.id}`,
                { booking_id: booking.id, user_id }
            );

            // Обновляем бронирование с информацией о платеже
            await Booking.update(booking_id, {
                payment_id: payment.id,
                payment_status: payment.status,
            });

            res.status(200).json({
                success: true,
                payment_id: payment.id,
                confirmation_url: payment.confirmation.confirmation_url,
                status: payment.status,
            });
        } catch (error) {
            console.error('Error creating payment:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании платежа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Проверка статуса платежа
     */
    async checkPaymentStatus(req: Request, res: Response) {
        try {
            const { booking_id } = req.params;
            const { user_id } = req.user;

            // Получаем бронирование
            const booking = await Booking.findById(booking_id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            // Проверяем, принадлежит ли бронирование текущему пользователю
            if (booking.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для проверки статуса этого бронирования',
                });
            }

            if (!booking.payment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Для этого бронирования не создан платеж',
                });
            }

            // Получаем информацию о платеже
            const paymentInfo = await paymentService.getPaymentInfo(booking.payment_id);
            
            // Если платеж успешен, обновляем статус бронирования
            if (paymentInfo.status === 'succeeded' && paymentInfo.paid) {
                await Booking.update(booking_id, {
                    status: 'confirmed',
                    payment_status: paymentInfo.status,
                    confirmed_at: new Date(),
                });
            } else {
                await Booking.update(booking_id, {
                    payment_status: paymentInfo.status,
                });
            }

            // Получаем обновленное бронирование
            const updatedBooking = await Booking.findById(booking_id);

            res.status(200).json({
                success: true,
                booking_status: updatedBooking?.status,
                payment_status: paymentInfo.status,
                paid: paymentInfo.paid,
            });
        } catch (error) {
            console.error('Error checking payment status:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при проверке статуса платежа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Возврат платежа
     */
    async refundPayment(req: AuthenticatedRequest, res: Response) {
        try {
            const { booking_id } = req.body;
            const { user_id } = req.user;

            // Получаем бронирование
            const booking = await Booking.findById(booking_id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            // Проверяем, принадлежит ли бронирование текущему пользователю
            if (booking.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для возврата средств за это бронирование',
                });
            }

            if (!booking.payment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Для этого бронирования не создан платеж',
                });
            }

            if (booking.status !== 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Возврат возможен только для подтвержденных бронирований',
                });
            }

            // Выполняем возврат платежа
            const refund = await paymentService.refundPayment(
                booking.payment_id,
                booking.total_price,
                `Возврат средств за бронирование #${booking.id}`
            );

            // Обновляем статус бронирования
            await Booking.update(booking_id, {
                status: 'refunded',
                refunded_at: new Date(),
            });

            res.status(200).json({
                success: true,
                refund_id: refund.id,
                status: refund.status,
                message: 'Возврат средств успешно выполнен',
            });
        } catch (error) {
            console.error('Error refunding payment:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при выполнении возврата',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Проверка доступности объекта недвижимости в указанные даты
     */
    async checkPropertyAvailability(req: Request, res: Response) {
        try {
            const { property_id } = req.params;
            const { check_in_date, check_out_date } = req.query;

            if (!check_in_date || !check_out_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Необходимо указать даты заезда и выезда',
                });
            }

            const isAvailable = await Booking.isPropertyAvailable(
                property_id,
                check_in_date as string,
                check_out_date as string
            );

            res.status(200).json({
                success: true,
                isAvailable,
                message: isAvailable 
                    ? 'Объект доступен в указанные даты' 
                    : 'Объект недоступен в указанные даты',
            });
        } catch (error) {
            console.error('Error checking property availability:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при проверке доступности объекта',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },

    /**
     * Создание платежной сессии с использованием Stripe
     */
    async createStripePayment(req: AuthenticatedRequest, res: Response) {
        try {
            const { booking_id } = req.body;
            const { user_id } = req.user;

            // Получаем бронирование
            const booking = await Booking.findById(booking_id);

            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Бронирование не найдено',
                });
            }

            // Проверяем, принадлежит ли бронирование текущему пользователю
            if (booking.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для оплаты этого бронирования',
                });
            }

            // Проверяем статус бронирования
            if (booking.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: `Невозможно оплатить бронирование в статусе "${booking.status}"`,
                });
            }

            // Создаем платежную сессию Stripe
            const session = await paymentService.createStripeSession(
                booking.total_price,
                `Оплата бронирования #${booking.id}`,
                { booking_id: booking.id, user_id }
            );

            // Обновляем бронирование с информацией о платеже
            await Booking.update(booking_id, {
                payment_id: session.session_id,
                payment_status: 'pending',
            });

            res.status(200).json({
                success: true,
                session_id: session.session_id,
                payment_url: session.url,
                message: 'Платежная сессия успешно создана',
            });
        } catch (error) {
            console.error('Error creating Stripe payment session:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании платежной сессии',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
}; 