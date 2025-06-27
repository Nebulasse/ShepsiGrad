import api from './api';
import { 
  Message, 
  Conversation, 
  MessageCreateData, 
  ConversationCreateData,
  MessageQueryParams
} from '../types/Chat';

// Сервис для работы с чатом
const chatService = {
  // Получить все диалоги пользователя
  getUserConversations: async (): Promise<Conversation[]> => {
    try {
      const response = await api.get('/chats');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении диалогов:', error);
      throw error;
    }
  },
  
  // Получить диалог по ID
  getConversationById: async (conversationId: string): Promise<Conversation | null> => {
    try {
      const response = await api.get(`/chats/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении диалога:', error);
      throw error;
    }
  },
  
  // Создать новый диалог для объекта недвижимости
  createPropertyConversation: async (propertyId: string, initialMessage?: string): Promise<Conversation> => {
    try {
      const response = await api.post(`/chats/property/${propertyId}`, {
        initialMessage
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании диалога:', error);
      throw error;
    }
  },
  
  // Создать новый диалог для бронирования
  createBookingConversation: async (bookingId: string, initialMessage?: string): Promise<Conversation> => {
    try {
      const response = await api.post(`/chats/booking/${bookingId}`, {
        initialMessage
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании диалога:', error);
      throw error;
    }
  },
  
  // Получить сообщения диалога
  getConversationMessages: async (params: MessageQueryParams): Promise<Message[]> => {
    try {
      const { conversationId, limit = 20 } = params;
      const response = await api.get(`/chats/${conversationId}/messages`, {
        limit
      });
      
      // Автоматически помечаем сообщения как прочитанные
      await chatService.markMessagesAsRead(conversationId);
      
      return response.data.messages;
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
      throw error;
    }
  },
  
  // Отправить новое сообщение
  sendMessage: async (data: MessageCreateData): Promise<Message> => {
    try {
      const response = await api.post(`/chats/${data.conversationId}/messages`, {
        content: data.content,
        attachments: data.attachments
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      throw error;
    }
  },
  
  // Пометить сообщения как прочитанные
  markMessagesAsRead: async (conversationId: string): Promise<void> => {
    try {
      await api.put(`/chats/${conversationId}/read`);
    } catch (error) {
      console.error('Ошибка при маркировке сообщений как прочитанных:', error);
      throw error;
    }
  },
  
  // Получить общее количество непрочитанных сообщений
  getTotalUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get('/chats/unread/count');
      return response.data.count;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных сообщений:', error);
      throw error;
    }
  },
  
  // Тестовый метод для отправки сообщения через WebSocket
  testSendMessage: async (recipientId: string, message: string): Promise<any> => {
    try {
      const response = await api.post('/chats/test/connection', {
        recipientId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при тестировании отправки сообщения:', error);
      throw error;
    }
  }
};

export default chatService; 