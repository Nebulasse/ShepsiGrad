"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const paymentService_1 = __importDefault(require("../../services/paymentService"));
// Мокаем зависимости
jest.mock('axios');
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('test-uuid-1234')
}));
jest.mock('../../config/appConfig', () => ({
    config: {
        payment: {
            yookassa: {
                shopId: 'test-shop-id',
                secretKey: 'test-secret-key'
            },
            stripe: {
                secretKey: 'test-stripe-key'
            }
        }
    }
}));
jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn()
    }
}));
describe('PaymentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('createPayment', () => {
        it('should create a payment with YooKassa', async () => {
            // Мокаем ответ от YooKassa API
            axios_1.default.post.mockResolvedValueOnce({
                data: {
                    id: 'yookassa-payment-id',
                    status: 'pending',
                    confirmation: {
                        confirmation_url: 'https://yookassa.ru/confirm/123'
                    }
                }
            });
            // Создаем тестовые данные
            const mockBooking = {
                id: 'booking123',
                totalPrice: 1000,
                checkIn: new Date('2025-07-01'),
                checkOut: new Date('2025-07-10'),
                guests: 2
            };
            const mockUser = {
                id: 'user123',
                name: 'Test User'
            };
            const mockProperty = {
                id: 'property123',
                title: 'Test Property'
            };
            // Вызываем метод сервиса
            const result = await paymentService_1.default.createPayment({
                booking: mockBooking,
                user: mockUser,
                property: mockProperty,
                paymentMethod: 'yookassa',
                returnUrl: 'https://example.com/return'
            });
            // Проверяем результат
            expect(result).toHaveProperty('id', 'test-uuid-1234');
            expect(result).toHaveProperty('bookingId', 'booking123');
            expect(result).toHaveProperty('userId', 'user123');
            expect(result).toHaveProperty('propertyId', 'property123');
            expect(result).toHaveProperty('amount', 1000);
            expect(result).toHaveProperty('currency', 'RUB');
            expect(result).toHaveProperty('status', 'pending');
            expect(result).toHaveProperty('paymentMethod', 'yookassa');
            expect(result).toHaveProperty('gatewayReference', 'yookassa-payment-id');
            expect(result.metadata).toHaveProperty('confirmationUrl', 'https://yookassa.ru/confirm/123');
            // Проверяем, что был сделан правильный запрос к YooKassa API
            expect(axios_1.default.post).toHaveBeenCalledWith('https://api.yookassa.ru/v3/payments', expect.objectContaining({
                amount: {
                    value: '1000.00',
                    currency: 'RUB'
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: 'https://example.com/return'
                },
                description: 'Оплата бронирования #booking123',
                metadata: {
                    paymentId: 'test-uuid-1234',
                    bookingId: 'booking123'
                }
            }), expect.objectContaining({
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Idempotence-Key': 'test-uuid-1234'
                })
            }));
        });
        it('should throw error for unsupported payment method', async () => {
            // Создаем тестовые данные
            const mockBooking = {
                id: 'booking123',
                totalPrice: 1000,
                checkIn: new Date('2025-07-01'),
                checkOut: new Date('2025-07-10'),
                guests: 2
            };
            const mockUser = {
                id: 'user123',
                name: 'Test User'
            };
            const mockProperty = {
                id: 'property123',
                title: 'Test Property'
            };
            // Проверяем, что метод выбрасывает ошибку
            await expect(paymentService_1.default.createPayment({
                booking: mockBooking,
                user: mockUser,
                property: mockProperty,
                paymentMethod: 'unsupported',
                returnUrl: 'https://example.com/return'
            })).rejects.toThrow('Неподдерживаемый метод оплаты: unsupported');
        });
    });
    describe('refundPayment', () => {
        it('should throw error if payment not found', async () => {
            // Мокаем getPaymentById, чтобы вернуть null
            jest.spyOn(paymentService_1.default, 'getPaymentById').mockResolvedValue(null);
            // Проверяем, что метод выбрасывает ошибку
            await expect(paymentService_1.default.refundPayment({
                paymentId: 'nonexistent'
            })).rejects.toThrow();
        });
    });
    // Дополнительные тесты для других методов сервиса можно добавить здесь
});
