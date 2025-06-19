import { api } from './api';
import { Booking, BookingCreateData, BookingFilterParams, BookingStatus, BookingStatusUpdate } from '../types/Booking';

// Временные тестовые данные бронирований
const BOOKINGS: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    propertyTitle: 'Апартаменты на берегу моря',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-07-15',
    checkOutDate: '2023-07-22',
    guestsCount: 2,
    guestName: 'Александр Иванов',
    guestPhone: '+7 (999) 123-45-67',
    guestEmail: 'alex@example.com',
    totalPrice: 35000,
    status: 'confirmed',
    createdAt: '2023-06-10',
    paymentStatus: 'partial',
    paymentMethod: 'card'
  },
  {
    id: '2',
    propertyId: '2',
    propertyTitle: 'Уютная квартира в центре',
    propertyImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-08-10',
    checkOutDate: '2023-08-15',
    guestsCount: 1,
    guestName: 'Мария Петрова',
    guestPhone: '+7 (999) 987-65-43',
    totalPrice: 17500,
    status: 'completed',
    createdAt: '2023-07-20',
    paymentStatus: 'paid',
    paymentMethod: 'online'
  },
  {
    id: '3',
    propertyId: '3',
    propertyTitle: 'Коттедж с бассейном',
    propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-09-05',
    checkOutDate: '2023-09-12',
    guestsCount: 6,
    guestName: 'Сергей Смирнов',
    guestPhone: '+7 (999) 456-78-90',
    guestEmail: 'sergey@example.com',
    totalPrice: 56000,
    status: 'pending',
    createdAt: '2023-08-15',
    comments: 'Планируем приехать после 18:00, возможно ли позднее заселение?',
    paymentStatus: 'not_paid'
  },
  {
    id: '4',
    propertyId: '5',
    propertyTitle: 'Студия с видом на море',
    propertyImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-06-20',
    checkOutDate: '2023-06-27',
    guestsCount: 2,
    guestName: 'Екатерина Соколова',
    guestPhone: '+7 (999) 111-22-33',
    guestEmail: 'kate@example.com',
    totalPrice: 21000,
    status: 'cancelled',
    createdAt: '2023-05-25',
    cancellationReason: 'Изменились планы на отпуск',
    paymentStatus: 'refunded'
  },
  {
    id: '5',
    propertyId: '4',
    propertyTitle: 'Гостевой дом в Шепси',
    propertyImage: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-10-01',
    checkOutDate: '2023-10-10',
    guestsCount: 4,
    guestName: 'Дмитрий Волков',
    guestPhone: '+7 (999) 333-44-55',
    totalPrice: 36000,
    status: 'confirmed',
    createdAt: '2023-09-05',
    paymentStatus: 'partial',
    paymentMethod: 'transfer'
  },
  {
    id: '6',
    propertyId: '1',
    propertyTitle: 'Апартаменты на берегу моря',
    propertyImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    checkInDate: '2023-11-15',
    checkOutDate: '2023-11-20',
    guestsCount: 3,
    guestName: 'Анна Козлова',
    guestPhone: '+7 (999) 777-88-99',
    guestEmail: 'anna@example.com',
    totalPrice: 25000,
    status: 'pending',
    createdAt: '2023-10-20',
    paymentStatus: 'not_paid'
  }
];

/**
 * Сервис для работы с бронированиями
 */
export const bookingService = {
  /**
   * Получение списка бронирований пользователя
   * @returns Список бронирований
   */
  async getUserBookings(): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings/user');
      return response.data.bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  /**
   * Получение бронирования по ID
   * @param id ID бронирования
   * @returns Данные бронирования
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data.booking;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Создание нового бронирования
   * @param bookingData Данные для бронирования
   * @returns ID созданного бронирования
   */
  async createBooking(bookingData: Partial<Booking>): Promise<string> {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Отмена бронирования
   * @param id ID бронирования
   * @returns Обновленные данные бронирования
   */
  async cancelBooking(id: string): Promise<Booking> {
    try {
      const response = await api.post(`/bookings/${id}/cancel`);
      return response.data.booking;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Создание платежа для бронирования
   * @param bookingId ID бронирования
   * @returns URL для оплаты и ID платежа
   */
  async createPayment(bookingId: string): Promise<{ payment_id: string; confirmation_url: string }> {
    try {
      const response = await api.post('/bookings/payment/create', { booking_id: bookingId });
      return {
        payment_id: response.data.payment_id,
        confirmation_url: response.data.confirmation_url
      };
    } catch (error) {
      console.error(`Error creating payment for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Проверка статуса платежа
   * @param bookingId ID бронирования
   * @returns Статус платежа и бронирования
   */
  async checkPaymentStatus(bookingId: string): Promise<{ payment_status: string; booking_status: string }> {
    try {
      const response = await api.get(`/bookings/payment/status/${bookingId}`);
      return {
        payment_status: response.data.payment_status,
        booking_status: response.data.booking_status
      };
    } catch (error) {
      console.error(`Error checking payment status for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Получение бронирований для объекта недвижимости
   * @param propertyId ID объекта недвижимости
   * @returns Список бронирований
   */
  async getPropertyBookings(propertyId: string): Promise<Booking[]> {
    try {
      const response = await api.get(`/bookings/property/${propertyId}`);
      return response.data.bookings;
    } catch (error) {
      console.error(`Error fetching bookings for property ${propertyId}:`, error);
      throw error;
    }
  }
};

export default bookingService; 