"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const uuid_1 = require("uuid");
const appConfig_1 = require("../config/appConfig");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getModuleLogger)('PaymentService');
class PaymentService {
    // Создание платежа
    async createPayment(options) {
        try {
            const { booking, user, property, paymentMethod, returnUrl } = options;
            // Генерируем уникальный ID платежа
            const paymentId = (0, uuid_1.v4)();
            // Создаем платеж в базе данных
            const payment = {
                id: paymentId,
                bookingId: booking.id,
                userId: user.id,
                propertyId: property.id,
                amount: booking.totalPrice,
                currency: 'RUB', // По умолчанию используем рубли
                status: 'pending',
                paymentMethod,
                metadata: {
                    checkInDate: booking.checkInDate,
                    checkOutDate: booking.checkOutDate,
                    guestsCount: booking.guestsCount,
                }
            };
            // В зависимости от выбранного метода оплаты, интегрируемся с соответствующим платежным шлюзом
            switch (paymentMethod) {
                case 'yookassa':
                    return await this.processYookassaPayment(payment, returnUrl);
                case 'stripe':
                    return await this.processStripePayment(payment, returnUrl);
                default:
                    throw new Error(`Неподдерживаемый метод оплаты: ${paymentMethod}`);
            }
        }
        catch (error) {
            logger.error('Ошибка при создании платежа:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Обработка платежа через YooKassa
    async processYookassaPayment(payment, returnUrl) {
        try {
            // Формируем данные для запроса к YooKassa API
            const yookassaPayload = {
                amount: {
                    value: payment.amount.toFixed(2),
                    currency: payment.currency
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: returnUrl
                },
                description: `Оплата бронирования #${payment.bookingId}`,
                metadata: {
                    paymentId: payment.id,
                    bookingId: payment.bookingId
                }
            };
            // Отправляем запрос к YooKassa API
            const response = await axios_1.default.post('https://api.yookassa.ru/v3/payments', yookassaPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotence-Key': payment.id,
                    'Authorization': `Basic ${Buffer.from(appConfig_1.config.payment.yookassa.shopId + ':' + appConfig_1.config.payment.yookassa.secretKey).toString('base64')}`
                }
            });
            // Обновляем данные платежа
            payment.gatewayReference = response.data.id;
            payment.metadata = {
                ...payment.metadata,
                confirmationUrl: response.data.confirmation.confirmation_url,
                yookassaResponse: response.data
            };
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при обработке платежа через YooKassa:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            // Обновляем статус платежа на "failed"
            payment.status = 'failed';
            payment.metadata = {
                ...payment.metadata,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            throw error;
        }
    }
    // Обработка платежа через Stripe
    async processStripePayment(payment, returnUrl) {
        try {
            // Формируем данные для запроса к Stripe API
            const stripePayload = {
                amount: Math.round(payment.amount * 100), // Stripe работает с копейками
                currency: payment.currency.toLowerCase(),
                payment_method_types: ['card'],
                description: `Оплата бронирования #${payment.bookingId}`,
                metadata: {
                    paymentId: payment.id,
                    bookingId: payment.bookingId
                },
                success_url: `${returnUrl}?status=success&paymentId=${payment.id}`,
                cancel_url: `${returnUrl}?status=cancelled&paymentId=${payment.id}`
            };
            // Отправляем запрос к Stripe API
            const response = await axios_1.default.post('https://api.stripe.com/v1/checkout/sessions', stripePayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${appConfig_1.config.payment.stripe.secretKey}`
                }
            });
            // Обновляем данные платежа
            payment.gatewayReference = response.data.id;
            payment.metadata = {
                ...payment.metadata,
                checkoutUrl: response.data.url,
                stripeResponse: response.data
            };
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при обработке платежа через Stripe:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            // Обновляем статус платежа на "failed"
            payment.status = 'failed';
            payment.metadata = {
                ...payment.metadata,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            throw error;
        }
    }
    // Обработка успешного платежа
    async processSuccessfulPayment(options) {
        try {
            const { paymentId, gatewayReference } = options;
            // Получаем платеж из базы данных
            // const payment = await this.paymentRepository.findById(paymentId);
            const payment = {}; // Заглушка, заменить на реальный код
            if (!payment) {
                throw new Error(`Платеж с ID ${paymentId} не найден`);
            }
            // Проверяем статус платежа
            if (payment.status === 'completed') {
                return payment; // Платеж уже обработан
            }
            // Обновляем данные платежа
            payment.status = 'completed';
            payment.paymentDate = new Date();
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            // Обновляем статус бронирования
            // await this.bookingService.confirmBooking(payment.bookingId);
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при обработке успешного платежа:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Обработка неуспешного платежа
    async processFailedPayment(paymentId) {
        try {
            // Получаем платеж из базы данных
            // const payment = await this.paymentRepository.findById(paymentId);
            const payment = {}; // Заглушка, заменить на реальный код
            if (!payment) {
                throw new Error(`Платеж с ID ${paymentId} не найден`);
            }
            // Обновляем данные платежа
            payment.status = 'failed';
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при обработке неуспешного платежа:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Возврат платежа
    async refundPayment(options) {
        try {
            const { paymentId, amount, reason } = options;
            // Получаем платеж из базы данных
            // const payment = await this.paymentRepository.findById(paymentId);
            const payment = {}; // Заглушка, заменить на реальный код
            if (!payment) {
                throw new Error(`Платеж с ID ${paymentId} не найден`);
            }
            // Проверяем статус платежа
            if (payment.status !== 'completed') {
                throw new Error(`Невозможно вернуть платеж с статусом ${payment.status}`);
            }
            // В зависимости от платежного метода, интегрируемся с соответствующим платежным шлюзом
            switch (payment.paymentMethod) {
                case 'yookassa':
                    await this.refundYookassaPayment(payment, amount, reason);
                    break;
                case 'stripe':
                    await this.refundStripePayment(payment, amount, reason);
                    break;
                default:
                    throw new Error(`Неподдерживаемый метод оплаты для возврата: ${payment.paymentMethod}`);
            }
            // Обновляем данные платежа
            payment.status = 'refunded';
            payment.refundDate = new Date();
            // Сохраняем обновленный платеж в базу данных
            // await this.paymentRepository.save(payment);
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при возврате платежа:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Возврат платежа через YooKassa
    async refundYookassaPayment(payment, amount, reason) {
        try {
            // Формируем данные для запроса к YooKassa API
            const yookassaPayload = {
                amount: {
                    value: amount ? amount.toFixed(2) : payment.amount.toFixed(2),
                    currency: payment.currency
                },
                payment_id: payment.gatewayReference,
                description: reason || `Возврат платежа за бронирование #${payment.bookingId}`
            };
            // Отправляем запрос к YooKassa API
            await axios_1.default.post('https://api.yookassa.ru/v3/refunds', yookassaPayload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Idempotence-Key': (0, uuid_1.v4)(),
                    'Authorization': `Basic ${Buffer.from(appConfig_1.config.payment.yookassa.shopId + ':' + appConfig_1.config.payment.yookassa.secretKey).toString('base64')}`
                }
            });
        }
        catch (error) {
            logger.error('Ошибка при возврате платежа через YooKassa:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Возврат платежа через Stripe
    async refundStripePayment(payment, amount, reason) {
        try {
            // Формируем данные для запроса к Stripe API
            const stripePayload = {
                payment_intent: payment.gatewayReference,
                amount: amount ? Math.round(amount * 100) : undefined, // Stripe работает с копейками
                reason: 'requested_by_customer'
            };
            // Отправляем запрос к Stripe API
            await axios_1.default.post('https://api.stripe.com/v1/refunds', stripePayload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${appConfig_1.config.payment.stripe.secretKey}`
                }
            });
        }
        catch (error) {
            logger.error('Ошибка при возврате платежа через Stripe:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Получение платежа по ID
    async getPaymentById(paymentId) {
        try {
            // Получаем платеж из базы данных
            // const payment = await this.paymentRepository.findById(paymentId);
            const payment = null; // Заглушка, заменить на реальный код
            return payment;
        }
        catch (error) {
            logger.error('Ошибка при получении платежа по ID:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Получение платежей по ID бронирования
    async getPaymentsByBookingId(bookingId) {
        try {
            // Получаем платежи по ID бронирования
            // return await this.paymentRepository.findByBookingId(bookingId);
            const payments = []; // Заглушка, заменить на реальный код
            return payments;
        }
        catch (error) {
            logger.error('Ошибка при получении платежей по ID бронирования:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
    // Получение платежей по ID пользователя
    async getPaymentsByUserId(userId) {
        try {
            // Получаем платежи по ID пользователя
            // return await this.paymentRepository.findByUserId(userId);
            const payments = []; // Заглушка, заменить на реальный код
            return payments;
        }
        catch (error) {
            logger.error('Ошибка при получении платежей по ID пользователя:', error instanceof Error ? error.message : 'Неизвестная ошибка');
            throw error;
        }
    }
}
exports.default = new PaymentService();
