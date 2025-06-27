import axios from 'axios';
import { API_CONFIG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService, SyncChannel } from './syncService';
import { useSocket } from '../hooks/useSocket';

// Типы данных для чата
export interface Chat {
  id: string;
  booking_id?: string;
  property_id?: string;
  guest_id: string;
  host_id: string;
  last_message?: string;
  last_message_time?: string;
  created_at: string;
  updated_at: string;
  guest?: {
    id: string;
    name: string;
    avatar?: string;
  };
  property?: {
    id: string;
    title: string;
    image?: string;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ChatFilter {
  property_id?: string;
  booking_id?: string;
  unread_only?: boolean;
}

export interface MessagePagination {
  page: number;
  limit: number;
}

class ChatService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/chats`;
  
  // Получение заголовков авторизации
  private async getHeaders() {
    const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Получение списка чатов арендодателя
  async getLandlordChats(filters?: ChatFilter): Promise<Chat[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(this.apiUrl, { 
        headers,
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка чатов:', error);
      throw error;
    }
  }

  // Получение конкретного чата по ID
  async getChatById(chatId: string): Promise<Chat> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/${chatId}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении чата ${chatId}:`, error);
      throw error;
    }
  }

  // Создание или получение чата для объекта недвижимости
  async getOrCreatePropertyChat(propertyId: string, guestId: string): Promise<Chat> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.apiUrl}/property`, {
        property_id: propertyId,
        guest_id: guestId
      }, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при создании чата для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Создание или получение чата для бронирования
  async getOrCreateBookingChat(bookingId: string): Promise<Chat> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.apiUrl}/booking`, {
        booking_id: bookingId
      }, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при создании чата для бронирования ${bookingId}:`, error);
      throw error;
    }
  }

  // Получение сообщений чата с пагинацией
  async getChatMessages(chatId: string, pagination?: MessagePagination): Promise<{
    messages: Message[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const headers = await this.getHeaders();
      const params = pagination || { page: 1, limit: 20 };
      const response = await axios.get(`${this.apiUrl}/${chatId}/messages`, { 
        headers,
        params
      });
      
      // Отмечаем сообщения как прочитанные
      this.markMessagesAsRead(chatId);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении сообщений чата ${chatId}:`, error);
      throw error;
    }
  }

  // Отправка сообщения в чат
  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.apiUrl}/${chatId}/messages`, {
        content
      }, { headers });
      
      // Уведомляем о новом сообщении через синхронизацию
      syncService.publish(SyncChannel.CHAT_MESSAGE, 'new_message', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отправке сообщения в чат ${chatId}:`, error);
      throw error;
    }
  }

  // Отметка сообщений как прочитанных
  async markMessagesAsRead(chatId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.put(`${this.apiUrl}/${chatId}/read`, {}, { headers });
    } catch (error) {
      console.error(`Ошибка при отметке сообщений как прочитанных в чате ${chatId}:`, error);
      throw error;
    }
  }

  // Получение количества непрочитанных сообщений
  async getUnreadCount(): Promise<number> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/unread/count`, { headers });
      return response.data.count;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных сообщений:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();

// Хук для использования чата с WebSocket
export const useChatService = () => {
  const socket = useSocket();
  
  // Обработчик для получения сообщений в реальном времени
  const subscribeToChat = (chatId: string, onNewMessage: (message: Message) => void) => {
    if (!socket) {
      console.warn('WebSocket не подключен, невозможно подписаться на обновления чата');
      return () => {};
    }
    
    // Присоединяемся к комнате чата
    socket.emit('join_chat', { chatId });
    
    // Настраиваем обработчик новых сообщений
    const handleNewMessage = (data: any) => {
      if (data.chat_id === chatId) {
        onNewMessage(data);
      }
    };
    
    // Подписываемся на события
    socket.on('new_message', handleNewMessage);
    
    // Функция для отписки
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_chat', { chatId });
    };
  };
  
  // Отправка сообщения через WebSocket
  const sendMessageRealtime = async (chatId: string, content: string): Promise<void> => {
    if (!socket) {
      console.warn('WebSocket не подключен, сообщение будет отправлено через HTTP');
      await chatService.sendMessage(chatId, content);
      return;
    }
    
    return new Promise((resolve, reject) => {
      socket.emit('send_message', { chatId, content }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  };
  
  return {
    ...chatService,
    subscribeToChat,
    sendMessageRealtime,
    isSocketConnected: !!socket,
  };
}; 