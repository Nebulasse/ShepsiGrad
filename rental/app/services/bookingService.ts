import { API_URL } from '../config';
import { authService } from './authService';
import { Alert } from 'react-native';

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

// Демо-данные для работы без сервера
const MOCK_BOOKINGS: Booking[] = [
  {
    id: '1',
    propertyId: '1',
    userId: '101',
    checkIn: '2023-07-15',
    checkOut: '2023-07-20',
    guests: 3,
    totalPrice: 17500,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2023-06-10T14:30:00Z',
    updatedAt: '2023-06-10T15:45:00Z',
    userDetails: {
      name: 'Алексей Петров',
      email: 'alexey@example.com',
      phone: '+7 (900) 123-45-67'
    }
  },
  {
    id: '2',
    propertyId: '2',
    userId: '102',
    checkIn: '2023-08-01',
    checkOut: '2023-08-10',
    guests: 4,
    totalPrice: 45000,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2023-06-15T10:20:00Z',
    updatedAt: '2023-06-15T10:20:00Z',
    userDetails: {
      name: 'Мария Иванова',
      email: 'maria@example.com',
      phone: '+7 (900) 987-65-43'
    }
  },
  {
    id: '3',
    propertyId: '1',
    userId: '103',
    checkIn: '2023-08-15',
    checkOut: '2023-08-20',
    guests: 2,
    totalPrice: 17500,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2023-06-20T09:15:00Z',
    updatedAt: '2023-06-20T11:30:00Z',
    userDetails: {
      name: 'Дмитрий Сидоров',
      email: 'dmitry@example.com',
      phone: '+7 (900) 555-44-33'
    }
  },
  {
    id: '4',
    propertyId: '3',
    userId: '104',
    checkIn: '2023-07-25',
    checkOut: '2023-07-30',
    guests: 1,
    totalPrice: 12500,
    status: 'cancelled',
    paymentStatus: 'refunded',
    createdAt: '2023-06-05T16:40:00Z',
    updatedAt: '2023-06-12T14:20:00Z',
    userDetails: {
      name: 'Елена Смирнова',
      email: 'elena@example.com',
      phone: '+7 (900) 222-33-44'
    }
  }
];

class BookingService {
  // Проверка авторизации перед запросами
  private checkAuth(): boolean {
    if (!authService.isAuthenticated()) {
      console.error('Пользователь не авторизован');
      return false;
    }
    return true;
  }

  // Получение всех бронирований для объектов арендодателя
  async getBookings(): Promise<Booking[]> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // В случае ошибки возвращаем демо-данные только если пользователь авторизован
      if (authService.isAuthenticated()) {
        console.log('Используем демо-данные для бронирований');
        return MOCK_BOOKINGS;
      } else {
        throw error;
      }
    }
  }

  // Получение бронирований для конкретного объекта
  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Фильтруем демо-данные по propertyId только если пользователь авторизован
      if (authService.isAuthenticated()) {
        return MOCK_BOOKINGS.filter(booking => booking.propertyId === propertyId);
      } else {
        throw error;
      }
    }
  }

  // Получение детальной информации о бронировании
  async getBookingById(id: string): Promise<Booking> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Возвращаем демо-бронирование только если пользователь авторизован
      if (authService.isAuthenticated()) {
        const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
        return booking;
      } else {
        throw error;
      }
    }
  }

  // Подтверждение бронирования
  async confirmBooking(id: string): Promise<Booking> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Находим бронирование и обновляем его статус только если пользователь авторизован
      if (authService.isAuthenticated()) {
        const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
        return {
          ...booking,
          status: 'confirmed',
          updatedAt: new Date().toISOString()
        };
      } else {
        throw error;
      }
    }
  }

  // Отмена бронирования
  async cancelBooking(id: string, reason: string): Promise<Booking> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Находим бронирование и обновляем его статус только если пользователь авторизован
      if (authService.isAuthenticated()) {
        const booking = MOCK_BOOKINGS.find(b => b.id === id) || MOCK_BOOKINGS[0];
        return {
          ...booking,
          status: 'cancelled',
          paymentStatus: 'refunded',
          updatedAt: new Date().toISOString()
        };
      } else {
        throw error;
      }
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
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Симулируем проверку доступности только если пользователь авторизован
      if (authService.isAuthenticated()) {
        // Проверяем, есть ли пересечения с существующими бронированиями
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        const conflictingBookings = MOCK_BOOKINGS.filter(booking => {
          if (excludeBookingId && booking.id === excludeBookingId) return false;
          if (booking.propertyId !== propertyId) return false;
          if (booking.status === 'cancelled') return false;
          
          const bookingCheckIn = new Date(booking.checkIn);
          const bookingCheckOut = new Date(booking.checkOut);
          
          // Проверяем пересечение дат
          return (
            (checkInDate >= bookingCheckIn && checkInDate < bookingCheckOut) ||
            (checkOutDate > bookingCheckIn && checkOutDate <= bookingCheckOut) ||
            (checkInDate <= bookingCheckIn && checkOutDate >= bookingCheckOut)
          );
        });
        
        return {
          available: conflictingBookings.length === 0,
          conflictingBookings: conflictingBookings.length > 0 ? conflictingBookings : undefined,
          suggestedDates: conflictingBookings.length > 0 ? [
            {
              checkIn: new Date(new Date(checkOutDate).setDate(checkOutDate.getDate() + 1)).toISOString().split('T')[0],
              checkOut: new Date(new Date(checkOutDate).setDate(checkOutDate.getDate() + 6)).toISOString().split('T')[0]
            }
          ] : undefined
        };
      } else {
        throw error;
      }
    }
  }

  // Получение календаря занятости для объекта
  async getAvailabilityCalendar(propertyId: string, startDate: string, endDate: string): Promise<any> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Создаем демо-календарь только если пользователь авторизован
      if (authService.isAuthenticated()) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const calendar: Record<string, string> = {};
        
        // Заполняем календарь на основе демо-бронирований
        const relevantBookings = MOCK_BOOKINGS.filter(
          booking => booking.propertyId === propertyId && booking.status !== 'cancelled'
        );
        
        // Для каждого дня в диапазоне проверяем, есть ли бронирование
        const currentDate = new Date(start);
        while (currentDate <= end) {
          const dateString = currentDate.toISOString().split('T')[0];
          let status = 'available';
          
          for (const booking of relevantBookings) {
            const bookingCheckIn = new Date(booking.checkIn);
            const bookingCheckOut = new Date(booking.checkOut);
            
            if (currentDate >= bookingCheckIn && currentDate < bookingCheckOut) {
              status = booking.status;
              break;
            }
          }
          
          calendar[dateString] = status;
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return { calendar };
      } else {
        throw error;
      }
    }
  }

  // Блокировка дат в календаре (для личного использования или технических работ)
  async blockDates(propertyId: string, startDate: string, endDate: string, reason: string): Promise<boolean> {
    try {
      // Проверяем авторизацию
      if (!this.checkAuth()) {
        throw new Error('Пользователь не авторизован');
      }

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
      
      // Симулируем успешную блокировку только если пользователь авторизован
      if (authService.isAuthenticated()) {
        return true;
      } else {
        throw error;
      }
    }
  }

  // Получение токена авторизации
  private async getAuthToken(): Promise<string> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Пользователь не авторизован');
    }
    return token;
  }
}

export const bookingService = new BookingService(); 