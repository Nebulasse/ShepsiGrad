import { Socket } from 'socket.io';

/**
 * Базовый интерфейс для всех событий
 */
export interface SocketEvent {
  type: string;
  timestamp: number;
  [key: string]: any;
}

/**
 * Интерфейс для события аутентификации
 */
export interface AuthEvent extends SocketEvent {
  type: 'auth';
  token: string;
}

/**
 * Интерфейс для события сообщения в чате
 */
export interface ChatMessageEvent extends SocketEvent {
  type: 'chat_message';
  conversationId: string;
  senderId: string;
  message: string;
  attachments?: string[];
}

/**
 * Интерфейс для события обновления статуса бронирования
 */
export interface BookingStatusEvent extends SocketEvent {
  type: 'booking_status';
  bookingId: string;
  status: string;
  userId: string;
  propertyId: string;
}

/**
 * Интерфейс для события нового уведомления
 */
export interface NotificationEvent extends SocketEvent {
  type: 'notification';
  userId: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
}

/**
 * Интерфейс для события обновления объекта недвижимости
 */
export interface PropertyUpdateEvent extends SocketEvent {
  type: 'property_update';
  propertyId: string;
  ownerId: string;
  updates: any;
}

/**
 * Интерфейс для события подключения пользователя
 */
export interface UserConnectionEvent extends SocketEvent {
  type: 'user_connection';
  userId: string;
  status: 'online' | 'offline';
}

/**
 * Тип для всех возможных событий
 */
export type SocketEventType = 
  | AuthEvent 
  | ChatMessageEvent 
  | BookingStatusEvent 
  | NotificationEvent 
  | PropertyUpdateEvent 
  | UserConnectionEvent;

/**
 * Интерфейс для аутентифицированного сокета
 */
export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  isAuthenticated?: boolean;
} 