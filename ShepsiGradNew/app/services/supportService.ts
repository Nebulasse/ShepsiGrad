import { config } from '../config';
import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы данных
export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  message: string;
  isFromSupport: boolean;
  createdAt: string;
  attachments?: string[];
}

export interface CreateTicketData {
  subject: string;
  message: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
}

// Сервис для работы с технической поддержкой
class SupportService {
  // Создание нового тикета поддержки
  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    try {
      const response = await api.post('/support/tickets', data);
      return response;
    } catch (error) {
      console.error('Ошибка при создании тикета:', error);
      throw error;
    }
  }

  // Получение списка тикетов пользователя
  async getUserTickets(status?: string): Promise<SupportTicket[]> {
    try {
      const params = status ? { status } : undefined;
      const response = await api.get('/support/tickets', params);
      return response;
    } catch (error) {
      console.error('Ошибка при получении тикетов:', error);
      throw error;
    }
  }

  // Получение конкретного тикета по ID
  async getTicketById(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await api.get(`/support/tickets/${ticketId}`);
      return response;
    } catch (error) {
      console.error('Ошибка при получении тикета:', error);
      throw error;
    }
  }

  // Получение сообщений тикета
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    try {
      const response = await api.get(`/support/tickets/${ticketId}/messages`);
      return response;
    } catch (error) {
      console.error('Ошибка при получении сообщений тикета:', error);
      throw error;
    }
  }

  // Отправка нового сообщения в тикет
  async sendMessage(ticketId: string, message: string, attachments?: string[]): Promise<SupportMessage> {
    try {
      const response = await api.post(`/support/tickets/${ticketId}/messages`, {
        message,
        attachments
      });
      return response;
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error;
    }
  }

  // Закрытие тикета
  async closeTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/close`);
      return response;
    } catch (error) {
      console.error('Ошибка при закрытии тикета:', error);
      throw error;
    }
  }

  // Повторное открытие тикета
  async reopenTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const response = await api.put(`/support/tickets/${ticketId}/reopen`);
      return response;
    } catch (error) {
      console.error('Ошибка при повторном открытии тикета:', error);
      throw error;
    }
  }

  // Отправка быстрого сообщения в поддержку (без создания тикета)
  async sendQuickSupportMessage(message: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const response = await api.post('/support/quick-message', { message });
      return response;
    } catch (error) {
      console.error('Ошибка при отправке быстрого сообщения:', error);
      throw error;
    }
  }

  // Получение категорий поддержки
  async getSupportCategories(): Promise<string[]> {
    try {
      const response = await api.get('/support/categories');
      return response;
    } catch (error) {
      console.error('Ошибка при получении категорий поддержки:', error);
      throw error;
    }
  }

  // Получение часто задаваемых вопросов
  async getFAQs(): Promise<{ question: string; answer: string }[]> {
    try {
      const response = await api.get('/support/faqs');
      return response;
    } catch (error) {
      console.error('Ошибка при получении FAQ:', error);
      throw error;
    }
  }

  // Загрузка вложения для тикета
  async uploadAttachment(file: any): Promise<{ url: string; id: string }> {
    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('file', file);

      // Получаем токен для авторизации
      const token = await AsyncStorage.getItem('auth_token');
      
      // Отправляем запрос напрямую через fetch, т.к. api клиент не поддерживает FormData
      const response = await fetch(`${config.apiUrl}/support/attachments/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при загрузке вложения:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const supportService = new SupportService();

// Добавляем экспорт по умолчанию для совместимости с expo-router
export default supportService; 