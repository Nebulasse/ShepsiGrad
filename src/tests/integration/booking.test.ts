import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { app } from '../../app';
import { Booking, BookingStatus } from '../../models/Booking';
import { User } from '../../models/User';
import { Property } from '../../models/Property';
import { config } from '../../config/env';
import { MockBooking, MockUser, MockProperty } from '../types/models';

// Мокаем модели
jest.mock('../../models/Booking');
jest.mock('../../models/User');
jest.mock('../../models/Property');

describe('Booking API', () => {
  const testUserId = new mongoose.Types.ObjectId().toString();
  const testPropertyId = new mongoose.Types.ObjectId().toString();
  const testBookingId = new mongoose.Types.ObjectId().toString();
  
  // Создаем тестовый токен
  const testToken = jwt.sign({ userId: testUserId }, config.jwt.secret, { expiresIn: '1h' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/bookings/stats', () => {
    it('should return booking statistics', async () => {
      // Мокаем метод aggregate
      const mockAggregate = jest.fn().mockResolvedValue([
        { _id: BookingStatus.CONFIRMED, count: 5 },
        { _id: BookingStatus.PENDING, count: 3 }
      ]);
      
      (Booking as any).aggregate = mockAggregate;

      const response = await request(app)
        .get('/api/bookings/stats')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('stats');
      expect(response.body.stats).toHaveLength(2);
      expect(mockAggregate).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookings/count', () => {
    it('should return booking count', async () => {
      // Мокаем метод countDocuments
      const mockCountDocuments = jest.fn().mockResolvedValue(10);
      
      (Booking as any).countDocuments = mockCountDocuments;

      const response = await request(app)
        .get('/api/bookings/count')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count', 10);
      expect(mockCountDocuments).toHaveBeenCalled();
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a new booking', async () => {
      // Мокаем метод checkAvailability
      const mockCheckAvailability = jest.fn().mockResolvedValue(true);
      
      // Мокаем метод save
      const mockSave = jest.fn().mockResolvedValue({
        id: testBookingId,
        propertyId: testPropertyId,
        userId: testUserId,
        checkInDate: new Date('2023-12-01'),
        checkOutDate: new Date('2023-12-10'),
        guestsCount: 2,
        totalPrice: 1000,
        status: BookingStatus.PENDING,
        createdAt: new Date()
      });

      // Мокаем конструктор Booking
      (Booking as any).mockImplementation(() => ({
        save: mockSave
      }));

      // Мокаем методы findById
      (User as any).findById = jest.fn().mockResolvedValue({
        id: testUserId,
        name: 'Test User'
      } as MockUser);

      (Property as any).findById = jest.fn().mockResolvedValue({
        id: testPropertyId,
        title: 'Test Property',
        ownerId: 'owner123'
      } as MockProperty);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          propertyId: testPropertyId,
          checkIn: '2023-12-01',
          checkOut: '2023-12-10',
          guests: 2,
          totalPrice: 1000
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', testBookingId);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('GET /api/bookings/:id', () => {
    it('should return booking details', async () => {
      // Мокаем метод findById
      const mockFindById = jest.fn().mockResolvedValue({
        id: testBookingId,
        propertyId: testPropertyId,
        userId: testUserId,
        checkInDate: new Date('2023-12-01'),
        checkOutDate: new Date('2023-12-10'),
        guestsCount: 2,
        totalPrice: 1000,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date()
      } as MockBooking);
      
      (Booking as any).findById = mockFindById;

      // Мокаем метод findById для Property
      (Property as any).findById = jest.fn().mockResolvedValue({
        id: testPropertyId,
        title: 'Test Property',
        address: 'Test Address',
        images: ['image1.jpg'],
        ownerId: 'owner123'
      } as MockProperty);

      // Мокаем метод findById для User
      (User as any).findById = jest.fn().mockResolvedValue({
        id: testUserId,
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      } as MockUser);

      const response = await request(app)
        .get(`/api/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testBookingId);
      expect(mockFindById).toHaveBeenCalledWith(testBookingId);
    });

    it('should return 404 if booking not found', async () => {
      // Мокаем метод findById для возврата null
      const mockFindById = jest.fn().mockResolvedValue(null);
      
      (Booking as any).findById = mockFindById;

      const response = await request(app)
        .get(`/api/bookings/nonexistent`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(mockFindById).toHaveBeenCalled();
    });
  });
}); 