"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../../app");
const Booking_1 = require("../../models/Booking");
const User_1 = require("../../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appConfig_1 = require("../../config/appConfig");
// Мокаем модели и сервисы
jest.mock('../../models/Booking');
jest.mock('../../models/Property');
jest.mock('../../models/User');
jest.mock('../../services/paymentService');
describe('Booking API', () => {
    // Создаем тестовый токен для авторизации
    const testUserId = 'user123';
    const testToken = jsonwebtoken_1.default.sign({ id: testUserId }, appConfig_1.config.jwt.secret, { expiresIn: '1h' });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/bookings', () => {
        it('should return user bookings', async () => {
            // Мокаем метод агрегации для получения бронирований
            Booking_1.Booking.aggregate.mockResolvedValue([
                {
                    id: 'booking123',
                    propertyId: 'property123',
                    propertyName: 'Test Property',
                    propertyImage: 'image1.jpg',
                    checkIn: new Date('2025-07-01'),
                    checkOut: new Date('2025-07-10'),
                    guests: 2,
                    totalPrice: 1000,
                    status: 'confirmed',
                    createdAt: new Date()
                }
            ]);
            // Мокаем метод countDocuments
            Booking_1.Booking.countDocuments.mockResolvedValue(1);
            // Выполняем запрос
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/bookings')
                .set('Authorization', `Bearer ${testToken}`);
            // Проверяем результат
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bookings');
            expect(response.body.bookings).toHaveLength(1);
            expect(response.body).toHaveProperty('pagination');
            expect(response.body.pagination).toHaveProperty('total', 1);
        });
        it('should return 401 if not authenticated', async () => {
            // Выполняем запрос без токена
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/bookings');
            // Проверяем результат
            expect(response.status).toBe(401);
        });
    });
    describe('POST /api/bookings', () => {
        it('should create a booking', async () => {
            // Мокаем метод checkAvailability
            jest.spyOn(Booking_1.Booking.prototype, 'save').mockResolvedValue({
                id: 'booking123',
                propertyId: 'property123',
                userId: testUserId,
                checkIn: new Date('2025-07-01'),
                checkOut: new Date('2025-07-10'),
                guests: 2,
                totalPrice: 1000,
                status: 'pending',
                createdAt: new Date()
            });
            // Мокаем метод checkAvailability
            jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(app_1.app)), 'checkAvailability').mockResolvedValue(true);
            // Мокаем поиск пользователя и объекта
            User_1.User.findById.mockResolvedValue({
                id: testUserId,
                name: 'Test User'
            });
            Property_1.Property.findById.mockResolvedValue({
                id: 'property123',
                title: 'Test Property',
                ownerId: 'owner123'
            });
            // Выполняем запрос
            const response = await (0, supertest_1.default)(app_1.app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${testToken}`)
                .send({
                propertyId: 'property123',
                checkIn: '2025-07-01',
                checkOut: '2025-07-10',
                guests: 2,
                totalPrice: 1000
            });
            // Проверяем результат
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('id', 'booking123');
            expect(response.body).toHaveProperty('status', 'pending');
        });
    });
    describe('GET /api/bookings/:id', () => {
        it('should return booking details', async () => {
            // Мокаем поиск бронирования
            Booking_1.Booking.findById.mockResolvedValue({
                id: 'booking123',
                propertyId: 'property123',
                userId: testUserId,
                checkIn: new Date('2025-07-01'),
                checkOut: new Date('2025-07-10'),
                guests: 2,
                totalPrice: 1000,
                status: 'confirmed',
                createdAt: new Date()
            });
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
                id: testUserId,
                name: 'Test User',
                email: 'test@example.com',
                avatar: 'avatar.jpg'
            });
            // Выполняем запрос
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/bookings/booking123')
                .set('Authorization', `Bearer ${testToken}`);
            // Проверяем результат
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 'booking123');
            expect(response.body).toHaveProperty('propertyName', 'Test Property');
        });
        it('should return 404 if booking not found', async () => {
            // Мокаем поиск бронирования, чтобы вернуть null
            Booking_1.Booking.findById.mockResolvedValue(null);
            // Выполняем запрос
            const response = await (0, supertest_1.default)(app_1.app)
                .get('/api/bookings/nonexistent')
                .set('Authorization', `Bearer ${testToken}`);
            // Проверяем результат
            expect(response.status).toBe(404);
        });
    });
    // Дополнительные тесты для других эндпоинтов можно добавить здесь
});
