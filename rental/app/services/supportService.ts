import { API_CONFIG } from '../config';
import * as SecureStore from 'expo-secure-store';

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

class SupportService {
  private authToken: string | null = null;

  // Инициализация сервиса
  async initialize(): Promise<void> {
    try {
      this.authToken = await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Ошибка при инициализации SupportService:', error);
    }
  }

  // Получение заголовков для запросов
  private async getHeaders(): Promise<Headers> {
    if (!this.authToken) {
      this.authToken = await SecureStore.getItemAsync('auth_token');
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (this.authToken) {
      headers.append('Authorization', `Bearer ${this.authToken}`);
    }

    return headers;
  }

  // Создание нового тикета поддержки
  async createTicket(data: CreateTicketData): Promise<SupportTicket> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при создании тикета:', error);
      throw error;
    }
  }

  // Получение списка тикетов пользователя
  async getUserTickets(status?: string): Promise<SupportTicket[]> {
    try {
      const headers = await this.getHeaders();
      const url = status 
        ? `${API_CONFIG.baseUrl}/api/support/tickets?status=${status}` 
        : `${API_CONFIG.baseUrl}/api/support/tickets`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении тикетов:', error);
      throw error;
    }
  }

  // Получение конкретного тикета по ID
  async getTicketById(ticketId: string): Promise<SupportTicket> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets/${ticketId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении тикета:', error);
      throw error;
    }
  }

  // Получение сообщений тикета
  async getTicketMessages(ticketId: string): Promise<SupportMessage[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets/${ticketId}/messages`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении сообщений тикета:', error);
      throw error;
    }
  }

  // Отправка нового сообщения в тикет
  async sendMessage(ticketId: string, message: string, attachments?: string[]): Promise<SupportMessage> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message, attachments }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error;
    }
  }

  // Закрытие тикета
  async closeTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets/${ticketId}/close`, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при закрытии тикета:', error);
      throw error;
    }
  }

  // Повторное открытие тикета
  async reopenTicket(ticketId: string): Promise<SupportTicket> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/tickets/${ticketId}/reopen`, {
        method: 'PUT',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при повторном открытии тикета:', error);
      throw error;
    }
  }

  // Отправка быстрого сообщения в поддержку (без создания тикета)
  async sendQuickSupportMessage(message: string): Promise<{ success: boolean; messageId?: string }> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/quick-message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при отправке быстрого сообщения:', error);
      throw error;
    }
  }

  // Получение категорий поддержки
  async getSupportCategories(): Promise<string[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/categories`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении категорий поддержки:', error);
      throw error;
    }
  }

  // Получение часто задаваемых вопросов
  async getFAQs(): Promise<{ question: string; answer: string }[]> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/support/faqs`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при получении FAQ:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
export const supportService = new SupportService();

// Добавляем пустой компонент по умолчанию для expo-router
export default function SupportServiceComponent() {
  return null;
} 