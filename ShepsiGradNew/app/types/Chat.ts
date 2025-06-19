// Интерфейс для сообщения в чате
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: Attachment[];
}

// Интерфейс для диалога (переписки)
export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для участника диалога
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'guest' | 'host' | 'admin';
}

// Интерфейс для вложения в сообщении
export interface Attachment {
  id: string;
  type: 'image' | 'document' | 'location';
  url: string;
  thumbnail?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

// Интерфейс для создания нового сообщения
export interface MessageCreateData {
  conversationId: string;
  content: string;
  attachments?: Omit<Attachment, 'id'>[];
}

// Интерфейс для создания нового диалога
export interface ConversationCreateData {
  participantIds: string[];
  initialMessage?: string;
  propertyId?: string;
}

// Интерфейс для параметров запроса сообщений
export interface MessageQueryParams {
  conversationId: string;
  limit?: number;
  before?: string; // ID сообщения, перед которым нужно получить сообщения
  after?: string;  // ID сообщения, после которого нужно получить сообщения
}

// Default экспорт для избежания предупреждений expo-router
export default Message; 