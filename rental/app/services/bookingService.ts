import { API_URL } from '../config';

// Типы данных
export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  createdAt: string;
  updatedAt: string;
  userDetails?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface BookingAvailability {
  available: boolean;
  conflictingBookings?: Booking[];
  suggestedDates?: {
    checkIn: string;
    checkOut: string;
  }[];
}

class BookingService {
  // Получение всех бронирований для объектов арендодателя
  async getBookings(): Promise<Booking[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/landlord`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      return data.bookings;
    } catch (error) {
      console.error('Ошибка при получении бронирований:', error);
      throw error;
    }
  }

  // Получение бронирований для конкретного объекта
  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/property/${propertyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      return data.bookings;
    } catch (error) {
      console.error(`Ошибка при получении бронирований для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Получение детальной информации о бронировании
  async getBookingById(id: string): Promise<Booking> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при получении бронирования ${id}:`, error);
      throw error;
    }
  }

  // Подтверждение бронирования
  async confirmBooking(id: string): Promise<Booking> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/${id}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при подтверждении бронирования ${id}:`, error);
      throw error;
    }
  }

  // Отмена бронирования
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при отмене бронирования ${id}:`, error);
      throw error;
    }
  }

  // Проверка доступности дат для бронирования
  async checkAvailability(
    propertyId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): Promise<BookingAvailability> {
    try {
      const token = await this.getAuthToken();
      const url = new URL(`${API_URL}/api/bookings/check-availability`);
      url.searchParams.append('propertyId', propertyId);
      url.searchParams.append('checkIn', checkIn);
      url.searchParams.append('checkOut', checkOut);
      
      if (excludeBookingId) {
        url.searchParams.append('excludeBookingId', excludeBookingId);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при проверке доступности:', error);
      throw error;
    }
  }

  // Получение календаря занятости для объекта
  async getAvailabilityCalendar(propertyId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const token = await this.getAuthToken();
      const url = new URL(`${API_URL}/api/bookings/calendar`);
      url.searchParams.append('propertyId', propertyId);
      url.searchParams.append('startDate', startDate);
      url.searchParams.append('endDate', endDate);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении календаря занятости:', error);
      throw error;
    }
  }

  // Блокировка дат в календаре (для личного использования или технических работ)
  async blockDates(propertyId: string, startDate: string, endDate: string, reason: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/bookings/block-dates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          startDate,
          endDate,
          reason
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при блокировке дат:', error);
      throw error;
    }
  }

  // Получение токена авторизации (заглушка, нужно будет реализовать с AuthService)
  private async getAuthToken(): Promise<string> {
    // Здесь должна быть логика получения токена из хранилища или AuthService
    return 'dummy-token';
  }
}

export const bookingService = new BookingService(); 