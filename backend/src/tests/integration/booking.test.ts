import request from 'supertest';
import { app } from '../../app';
import { Booking } from '../../models/Booking';
import { Property } from '../../models/Property';
import { User } from '../../models/User';
import jwt from 'jsonwebtoken';
import { config } from '../../config/appConfig';

// Мокаем модели и сервисы
jest.mock('../../models/Booking');
jest.mock('../../models/Property');
jest.mock('../../models/User');
jest.mock('../../services/paymentService');

describe('Booking API', () => {
  // Создаем тестовый токен для авторизации
  const testUserId = 'user123';
  const testToken = jwt.sign({ id: testUserId }, config.jwt.secret, { expiresIn: '1h' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookings', () => {
    it('should return user bookings', async () => {
      // Мокаем метод агрегации для получения бронирований
      (Booking.aggregate as jest.Mock).mockResolvedValue([
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
      (Booking.countDocuments as jest.Mock).mockResolvedValue(1);

      // Выполняем запрос
      const response = await request(app)
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
      const response = await request(app)
        .get('/api/bookings');

      // Проверяем результат
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a booking', async () => {
      // Мокаем метод checkAvailability
      jest.spyOn(Booking.prototype, 'save').mockResolvedValue({
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
      jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(app)), 'checkAvailability').mockResolvedValue(true);

      // Мокаем поиск пользователя и объекта
      (User.findById as jest.Mock).mockResolvedValue({
        id: testUserId,
        name: 'Test User'
      });
      
      (Property.findById as jest.Mock).mockResolvedValue({
        id: 'property123',
        title: 'Test Property',
        ownerId: 'owner123'
      });

      // Выполняем запрос
      const response = await request(app)
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
      (Booking.findById as jest.Mock).mockResolvedValue({
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
      (Property.findById as jest.Mock).mockResolvedValue({
        id: 'property123',
        title: 'Test Property',
        address: 'Test Address',
        images: ['image1.jpg'],
        ownerId: 'owner123'
      });
      
      // Мокаем поиск пользователя
      (User.findById as jest.Mock).mockResolvedValue({
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      });

      // Выполняем запрос
      const response = await request(app)
        .get('/api/bookings/booking123')
        .set('Authorization', `Bearer ${testToken}`);

      // Проверяем результат
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'booking123');
      expect(response.body).toHaveProperty('propertyName', 'Test Property');
    });

    it('should return 404 if booking not found', async () => {
      // Мокаем поиск бронирования, чтобы вернуть null
      (Booking.findById as jest.Mock).mockResolvedValue(null);

      // Выполняем запрос
      const response = await request(app)
        .get('/api/bookings/nonexistent')
        .set('Authorization', `Bearer ${testToken}`);

      // Проверяем результат
      expect(response.status).toBe(404);
    });
  });

  // Дополнительные тесты для других эндпоинтов можно добавить здесь
}); 