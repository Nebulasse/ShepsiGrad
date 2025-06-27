import api from './api';

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
    city: string;
    country: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface BookingFilters {
  status?: string;
  propertyId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BookingResponse {
  bookings: Booking[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const bookingService = {
  /**
   * Получить все бронирования с фильтрацией
   */
  async getAllBookings(filters: BookingFilters = {}): Promise<BookingResponse> {
    try {
      const response = await api.get('/bookings', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
      throw error;
    }
  },

  /**
   * Получить бронирование по ID
   */
  async getBookingById(id: string): Promise<Booking> {
    try {
      const response = await api.get(`/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении бронирования с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Подтвердить бронирование
   */
  async confirmBooking(id: string): Promise<Booking> {
    try {
      const response = await api.patch(`/bookings/${id}/confirm`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при подтверждении бронирования с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Отменить бронирование
   */
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отмене бронирования с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Получить статистику по бронированиям
   */
  async getBookingStats(): Promise<any> {
    try {
      const response = await api.get('/bookings/stats');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении статистики по бронированиям:', error);
      throw error;
    }
  },

  /**
   * Получить последние бронирования
   */
  async getRecentBookings(limit: number = 5): Promise<Booking[]> {
    try {
      const response = await api.get('/bookings/recent', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении последних бронирований:', error);
      throw error;
    }
  }
};

export default bookingService; 