import { Request, Response } from 'express';
import bookingController from '../../controllers/bookingController';
import { Booking, BookingStatus, PaymentStatus } from '../../models/Booking';
import { Property } from '../../models/Property';
import { User } from '../../models/User';
import paymentService from '../../services/paymentService';
import { MockBooking, MockUser, MockProperty } from '../types/models';

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
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any = {};

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
        return mockResponse as Response;
      })
    };
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      // Настраиваем моки для успешного создания бронирования
      const mockBooking: MockBooking = {
        id: 'booking123',
        propertyId: 'property123',
        userId: 'user123',
        checkInDate: new Date('2025-07-01'),
        checkOutDate: new Date('2025-07-10'),
        guestsCount: 2,
        totalPrice: 1000,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        save: jest.fn().mockResolvedValue({
          id: 'booking123',
          propertyId: 'property123',
          userId: 'user123',
          checkInDate: new Date('2025-07-01'),
          checkOutDate: new Date('2025-07-10'),
          guestsCount: 2,
          totalPrice: 1000,
          status: BookingStatus.PENDING,
          createdAt: new Date()
        })
      };
      
      // Мокаем метод checkAvailability
      jest.spyOn(bookingController as any, 'checkAvailability').mockResolvedValue(true);
      
      // Мокаем конструктор Booking
      (Booking as jest.Mock).mockImplementation(() => mockBooking);
      
      // Мокаем поиск пользователя и объекта
      (User.findById as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Test User'
      } as MockUser);
      
      (Property.findById as jest.Mock).mockResolvedValue({
        id: 'property123',
        title: 'Test Property',
        ownerId: 'owner123'
      } as MockProperty);
      
      // Мокаем метод sendBookingNotification
      jest.spyOn(bookingController as any, 'sendBookingNotification').mockResolvedValue(undefined);
      
      // Настраиваем тело запроса
      mockRequest.body = {
        propertyId: 'property123',
        checkIn: '2025-07-01',
        checkOut: '2025-07-10',
        guests: 2,
        totalPrice: 1000
      };
      
      // Вызываем метод контроллера
      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);
      
      // Проверяем результат
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject).toHaveProperty('id', 'booking123');
      expect(responseObject).toHaveProperty('status', BookingStatus.PENDING);
      expect(mockBooking.save).toHaveBeenCalled();
    });

    it('should return 400 if property is not available', async () => {
      // Мокаем метод checkAvailability, чтобы вернуть false
      jest.spyOn(bookingController as any, 'checkAvailability').mockResolvedValue(false);
      
      // Настраиваем тело запроса
      mockRequest.body = {
        propertyId: 'property123',
        checkIn: '2025-07-01',
        checkOut: '2025-07-10',
        guests: 2,
        totalPrice: 1000
      };
      
      // Вызываем метод контроллера
      await bookingController.createBooking(mockRequest as Request, mockResponse as Response);
      
      // Проверяем результат
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject).toHaveProperty('message', 'Объект недоступен на указанные даты');
    });
  });

  describe('getBookingById', () => {
    it('should return booking details', async () => {
      // Настраиваем моки для получения бронирования
      const mockBooking: MockBooking = {
        id: 'booking123',
        propertyId: 'property123',
        userId: 'user123',
        checkInDate: new Date('2025-07-01'),
        checkOutDate: new Date('2025-07-10'),
        guestsCount: 2,
        totalPrice: 1000,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date()
      };
      
      // Мокаем поиск бронирования
      (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);
      
      // Мокаем поиск объекта
      (Property.findById as jest.Mock).mockResolvedValue({
        id: 'property123',
        title: 'Test Property',
        address: 'Test Address',
        images: ['image1.jpg'],
        ownerId: 'owner123'
      } as MockProperty);
      
      // Мокаем поиск пользователя
      (User.findById as jest.Mock).mockResolvedValue({
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      } as MockUser);
      
      // Мокаем получение платежей
      (paymentService.getPaymentsByBookingId as jest.Mock).mockResolvedValue([
        { id: 'payment123', status: 'completed', amount: 1000 }
      ]);
      
      // Настраиваем параметры запроса
      mockRequest.params = { id: 'booking123' };
      
      // Вызываем метод контроллера
      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);
      
      // Проверяем результат
      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject).toHaveProperty('id', 'booking123');
      expect(responseObject).toHaveProperty('propertyName', 'Test Property');
      expect(responseObject).toHaveProperty('payments');
    });

    it('should return 404 if booking not found', async () => {
      // Мокаем поиск бронирования, чтобы вернуть null
      (Booking.findById as jest.Mock).mockResolvedValue(null);
      
      // Настраиваем параметры запроса
      mockRequest.params = { id: 'nonexistent' };
      
      // Вызываем метод контроллера
      await bookingController.getBookingById(mockRequest as Request, mockResponse as Response);
      
      // Проверяем результат
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseObject).toHaveProperty('message', 'Бронирование не найдено');
    });
  });

  // Дополнительные тесты для других методов контроллера можно добавить здесь
}); 