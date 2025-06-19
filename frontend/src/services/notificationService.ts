import axios from 'axios';
import { API_URL } from '../config';

// Типы данных
export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface NotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

// Сервис для работы с уведомлениями
export const notificationService = {
  // Получить список уведомлений
  async getNotifications(params: NotificationsParams = {}): Promise<PaginatedNotifications> {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    }
    
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
      // Возвращаем пустой список в случае ошибки
      return {
        notifications: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0
        }
      };
    }
  },
  
  // Получить количество непрочитанных уведомлений
  async getUnreadCount(): Promise<number> {
    const token = localStorage.getItem('token');
    
    if (!token) return 0;
    
    try {
      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.count;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных уведомлений:', error);
      return 0;
    }
  },
  
  // Отметить уведомление как прочитанное
  async markAsRead(notificationId: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Отметить все уведомления как прочитанные
  async markAllAsRead(): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Создать тестовое уведомление (для разработки)
  async createTestNotification(): Promise<void> {
    const token = localStorage.getItem('token');
    
    if (!token) return;
    
    await axios.post(`${API_URL}/notifications/test`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}; 