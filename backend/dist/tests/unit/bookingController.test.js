"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bookingController_1 = __importDefault(require("../../controllers/bookingController"));
const Booking_1 = require("../../models/Booking");
const User_1 = require("../../models/User");
const paymentService_1 = __importDefault(require("../../services/paymentService"));
// Мокаем модели и сервисы
jest.mock('../../models/Booking');
jest.mock('../../models/Property');
jest.mock('../../models/User');
jest.mock('../../services/paymentService');
jest.mock('express-validator', () => ({
    validationResult: jest.fn().mockReturnValue({ isEmpty: () => true })
}));
jest.mock('../../utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn()
    }
}));
describe('BookingController', () => {
    let mockRequest;
    let mockResponse;
    let responseObject = {};
    beforeEach(() => {
        // Сбрасываем моки перед каждым тестом
        jest.clearAllMocks();
        // Настраиваем моки для запроса и ответа
        mockRequest = {
            user: { id: 'user123' },
            params: {},
            query: {},
            body: {}
        };
        responseObject = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation(result => {
                responseObject = result;
                return mockResponse;
            })
        };
    });
    describe('createBooking', () => {
        it('should create a booking successfully', async () => {
            // Настраиваем моки для успешного создания бронирования
            const mockBooking = {
                id: 'booking123',
                propertyId: 'property123',
                userId: 'user123',
                checkInDate: new Date('2025-07-01'),
                checkOutDate: new Date('2025-07-10'),
                guestsCount: 2,
                totalPrice: 1000,
                status: Booking_1.BookingStatus.PENDING,
                createdAt: new Date(),
                save: jest.fn().mockResolvedValue({
                    id: 'booking123',
                    propertyId: 'property123',
                    userId: 'user123',
                    checkInDate: new Date('2025-07-01'),
                    checkOutDate: new Date('2025-07-10'),
                    guestsCount: 2,
                    totalPrice: 1000,
                    status: Booking_1.BookingStatus.PENDING,
                    createdAt: new Date()
                })
            };
            // Мокаем метод checkAvailability
            jest.spyOn(bookingController_1.default, 'checkAvailability').mockResolvedValue(true);
            // Мокаем конструктор Booking
            Booking_1.Booking.mockImplementation(() => mockBooking);
            // Мокаем поиск пользователя и объекта
            User_1.User.findById.mockResolvedValue({
                id: 'user123',
                name: 'Test User'
            });
            Property_1.Property.findById.mockResolvedValue({
                id: 'property123',
                title: 'Test Property',
                ownerId: 'owner123'
            });
            // Мокаем метод sendBookingNotification
            jest.spyOn(bookingController_1.default, 'sendBookingNotification').mockResolvedValue(undefined);
            // Настраиваем тело запроса
            mockRequest.body = {
                propertyId: 'property123',
                checkIn: '2025-07-01',
                checkOut: '2025-07-10',
                guests: 2,
                totalPrice: 1000
            };
            // Вызываем метод контроллера
            await bookingController_1.default.createBooking(mockRequest, mockResponse);
            // Проверяем результат
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(responseObject).toHaveProperty('id', 'booking123');
            expect(responseObject).toHaveProperty('status', Booking_1.BookingStatus.PENDING);
            expect(mockBooking.save).toHaveBeenCalled();
        });
        it('should return 400 if property is not available', async () => {
            // Мокаем метод checkAvailability, чтобы вернуть false
            jest.spyOn(bookingController_1.default, 'checkAvailability').mockResolvedValue(false);
            // Настраиваем тело запроса
            mockRequest.body = {
                propertyId: 'property123',
                checkIn: '2025-07-01',
                checkOut: '2025-07-10',
                guests: 2,
                totalPrice: 1000
            };
            // Вызываем метод контроллера
            await bookingController_1.default.createBooking(mockRequest, mockResponse);
            // Проверяем результат
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseObject).toHaveProperty('message', 'Объект недоступен на указанные даты');
        });
    });
    describe('getBookingById', () => {
        it('should return booking details', async () => {
            // Настраиваем моки для получения бронирования
            const mockBooking = {
                id: 'booking123',
                propertyId: 'property123',
                userId: 'user123',
                checkInDate: new Date('2025-07-01'),
                checkOutDate: new Date('2025-07-10'),
                guestsCount: 2,
                totalPrice: 1000,
                status: Booking_1.BookingStatus.CONFIRMED,
                createdAt: new Date()
            };
            // Мокаем поиск бронирования
            Booking_1.Booking.findById.mockResolvedValue(mockBooking);
            // Мокаем поиск объекта
            Property_1.Property.findById.mockResolvedValue({
                id: 'property123',
                title: 'Test Property',
                address: 'Test Address',
                images: ['image1.jpg'],
                ownerId: 'owner123'
            });
            // Мокаем поиск пользователя
            User_1.User.findById.mockResolvedValue({
                id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
                avatar: 'avatar.jpg'
            });
            // Мокаем получение платежей
            paymentService_1.default.getPaymentsByBookingId.mockResolvedValue([
                { id: 'payment123', status: 'completed', amount: 1000 }
            ]);
            // Настраиваем параметры запроса
            mockRequest.params = { id: 'booking123' };
            // Вызываем метод контроллера
            await bookingController_1.default.getBookingById(mockRequest, mockResponse);
            // Проверяем результат
            expect(mockResponse.json).toHaveBeenCalled();
            expect(responseObject).toHaveProperty('id', 'booking123');
            expect(responseObject).toHaveProperty('propertyName', 'Test Property');
            expect(responseObject).toHaveProperty('payments');
        });
        it('should return 404 if booking not found', async () => {
            // Мокаем поиск бронирования, чтобы вернуть null
            Booking_1.Booking.findById.mockResolvedValue(null);
            // Настраиваем параметры запроса
            mockRequest.params = { id: 'nonexistent' };
            // Вызываем метод контроллера
            await bookingController_1.default.getBookingById(mockRequest, mockResponse);
            // Проверяем результат
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(responseObject).toHaveProperty('message', 'Бронирование не найдено');
        });
    });
    // Дополнительные тесты для других методов контроллера можно добавить здесь
});
