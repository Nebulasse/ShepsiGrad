import io, { Socket } from 'socket.io-client';
import { authService } from './authService';
import { API_URL } from '../config';

// Типы сообщений для синхронизации
export enum SyncEventType {
  PROPERTY = 'property-update',
  BOOKING = 'booking-update',
  CHAT = 'new-message',
  NOTIFICATION = 'new-notification',
  USER = 'user-update',
  FAVORITE = 'favorite-update'
}

// Типы данных для событий
export interface SyncEvent<T = any> {
  type: SyncEventType;
  data: T;
  timestamp: number;
}

// Типы подписчиков для различных событий
type PropertySubscriber = (propertyId: string, data: any, operation: string) => void;
type BookingSubscriber = (bookingId: string, data: any, operation: string) => void;
type ChatSubscriber = (message: any) => void;
type NotificationSubscriber = (notification: any) => void;
type UserSubscriber = (userId: string, data: any) => void;
type FavoriteSubscriber = (favoriteId: string, data: any, operation: string) => void;

class SyncService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private isAuthenticated: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private appId: string = 'web-app';

  // Инициализация сервиса синхронизации
  async initialize(appId: string = 'web-app'): Promise<boolean> {
    this.appId = appId;
    
    if (this.socket) {
      return this.isConnected;
    }
    
    try {
      this.socket = io(`${API_URL}`, {
        transports: ['websocket', 'polling'],
        query: {
          appId: this.appId
        }
      });
      
      // Обработчики событий сокета
      this.setupSocketHandlers();
      
      // Аутентификация пользователя
      await this.authenticateUser();
      
      return this.isConnected;
    } catch (error) {
      console.error('Ошибка инициализации синхронизации:', error);
      return false;
    }
  }

  // Настройка обработчиков событий сокета
  private setupSocketHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Соединение с сервером синхронизации установлено');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Аутентификация после повторного подключения
      this.authenticateUser();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Соединение с сервером синхронизации разорвано');
      this.isConnected = false;
      this.isAuthenticated = false;
      
      // Автоматическое переподключение
      this.reconnect();
    });
    
    this.socket.on('error', (error) => {
      console.error('Ошибка сокета:', error);
    });
    
    // Обработчики событий синхронизации
    this.socket.on(SyncEventType.PROPERTY, (data) => {
      this.notifySubscribers(SyncEventType.PROPERTY, data);
    });
    
    this.socket.on(SyncEventType.BOOKING, (data) => {
      this.notifySubscribers(SyncEventType.BOOKING, data);
    });
    
    this.socket.on(SyncEventType.CHAT, (data) => {
      this.notifySubscribers(SyncEventType.CHAT, data);
    });
    
    this.socket.on(SyncEventType.NOTIFICATION, (data) => {
      this.notifySubscribers(SyncEventType.NOTIFICATION, data);
    });
    
    this.socket.on(SyncEventType.USER, (data) => {
      this.notifySubscribers(SyncEventType.USER, data);
    });
    
    this.socket.on(SyncEventType.FAVORITE, (data) => {
      this.notifySubscribers(SyncEventType.FAVORITE, data);
    });
  }

  // Аутентификация пользователя
  private async authenticateUser(): Promise<void> {
    if (!this.socket || this.isAuthenticated) return;
    
    try {
      const token = await authService.getAccessToken();
      
      if (token) {
        this.socket.emit('authenticate', { token });
        this.isAuthenticated = true;
        console.log('Пользователь аутентифицирован для синхронизации');
      }
    } catch (error) {
      console.error('Ошибка аутентификации для синхронизации:', error);
    }
  }

  // Повторное подключение
  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Превышено максимальное число попыток переподключения');
      return;
    }
    
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Попытка переподключения ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
      
      if (this.socket) {
        this.socket.connect();
      }
    }, this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts));
  }

  // Уведомление подписчиков о событии
  private notifySubscribers(eventType: SyncEventType, data: any): void {
    const subscribers = this.subscriptions.get(eventType);
    
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Ошибка в подписчике для ${eventType}:`, error);
        }
      });
    }
  }

  // Подписка на обновления объекта недвижимости
  subscribeToProperty(propertyId: string, callback: PropertySubscriber): () => void {
    if (!this.socket || !this.isConnected) {
      console.warn('Невозможно подписаться: нет соединения');
      return () => {};
    }
    
    this.socket.emit('subscribe-property', propertyId);
    
    const wrappedCallback = (data: any) => {
      if (data.propertyId === propertyId) {
        callback(data.propertyId, data.data, data.operation);
      }
    };
    
    this.addSubscriber(SyncEventType.PROPERTY, wrappedCallback);
    
    return () => {
      this.removeSubscriber(SyncEventType.PROPERTY, wrappedCallback);
      if (this.socket && this.isConnected) {
        this.socket.emit('unsubscribe-property', propertyId);
      }
    };
  }

  // Подписка на обновления бронирования
  subscribeToBooking(callback: BookingSubscriber): () => void {
    this.addSubscriber(SyncEventType.BOOKING, callback);
    
    return () => {
      this.removeSubscriber(SyncEventType.BOOKING, callback);
    };
  }

  // Подписка на чат
  subscribeToChat(chatId: string, callback: ChatSubscriber): () => void {
    if (!this.socket || !this.isConnected) {
      console.warn('Невозможно подписаться: нет соединения');
      return () => {};
    }
    
    this.socket.emit('join-chat', chatId);
    
    const wrappedCallback = (data: any) => {
      if (data.chatId === chatId) {
        callback(data.message);
      }
    };
    
    this.addSubscriber(SyncEventType.CHAT, wrappedCallback);
    
    return () => {
      this.removeSubscriber(SyncEventType.CHAT, wrappedCallback);
      if (this.socket && this.isConnected) {
        this.socket.emit('leave-chat', chatId);
      }
    };
  }

  // Отправка сообщения в чат
  sendChatMessage(chatId: string, message: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected || !this.isAuthenticated) {
        reject(new Error('Невозможно отправить сообщение: нет соединения или аутентификации'));
        return;
      }
      
      this.socket.emit('send-message', { chatId, message }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(true);
        }
      });
    });
  }

  // Подписка на уведомления
  subscribeToNotifications(userId: string, callback: NotificationSubscriber): () => void {
    if (!this.socket || !this.isConnected) {
      console.warn('Невозможно подписаться: нет соединения');
      return () => {};
    }
    
    this.socket.emit('subscribe-notifications', userId);
    
    this.addSubscriber(SyncEventType.NOTIFICATION, callback);
    
    return () => {
      this.removeSubscriber(SyncEventType.NOTIFICATION, callback);
      if (this.socket && this.isConnected) {
        this.socket.emit('unsubscribe-notifications', userId);
      }
    };
  }

  // Добавление подписчика
  private addSubscriber(eventType: SyncEventType, callback: Function): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType)?.add(callback);
  }

  // Удаление подписчика
  private removeSubscriber(eventType: SyncEventType, callback: Function): void {
    const subscribers = this.subscriptions.get(eventType);
    
    if (subscribers) {
      subscribers.delete(callback);
    }
  }

  // Отключение
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isAuthenticated = false;
    }
  }
}

// Экспорт единственного экземпляра сервиса
export const syncService = new SyncService(); 