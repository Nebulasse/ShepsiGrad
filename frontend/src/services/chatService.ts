import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount?: number;
}

export const chatService = {
  // Получить все чаты пользователя
  getUserChats: async (userId: string): Promise<Chat[]> => {
    try {
      const response = await axios.get(`${API_URL}/chats/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  // Получить сообщения чата
  getChatMessages: async (chatId: string): Promise<Message[]> => {
    try {
      const response = await axios.get(`${API_URL}/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Отправить сообщение
  sendMessage: async (chatId: string, message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<Message> => {
    try {
      const response = await axios.post(`${API_URL}/chats/${chatId}/messages`, message);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Отметить сообщения как прочитанные
  markAsRead: async (chatId: string, userId: string): Promise<void> => {
    try {
      await axios.put(`${API_URL}/chats/${chatId}/read/${userId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Создать новый чат
  createChat: async (participants: string[]): Promise<Chat> => {
    try {
      const response = await axios.post(`${API_URL}/chats`, { participants });
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }
};

export default chatService; 