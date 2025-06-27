import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { API_URL } from '../config';

// Типы сообщений для синхронизации
export enum SyncEventType {
  PROPERTY = 'property-update',
  BOOKING = 'booking-update',
  CHAT = 'new-message',
  NOTIFICATION = 'new-notification'
}

class SyncService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private subscriptions: Map<string, Set<Function>> = new Map();
  private appType: string = '';
  private unsubscribe: (() => void) | null = null;

  initialize(appType: string) {
    this.appType = appType;
    console.log(`Инициализация сервиса синхронизации для ${appType}`);
    
    // Подписываемся на изменения состояния сети
    try {
      this.unsubscribe = NetInfo.addEventListener(state => {
        this.isConnected = state.isConnected || false;
        console.log(`Состояние сети: ${this.isConnected ? 'подключено' : 'отключено'}`);
        
        if (this.isConnected) {
          this.startSync();
        } else {
          this.stopSync();
        }
      });
    } catch (error) {
      console.error('Ошибка при инициализации NetInfo:', error);
    }
  }

  disconnect() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    console.log('Отключение сервиса синхронизации');
  }

  private startSync() {
    console.log(`Запуск синхронизации для ${this.appType}`);
    
    // Создаем сокет-соединение, если оно еще не создано
    if (!this.socket) {
      try {
        this.socket = io(API_URL.replace('/api', ''), {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          query: {
            appType: this.appType
          }
        });
        
        // Настраиваем обработчики событий
        this.setupSocketHandlers();
        
        console.log('Сокет-соединение инициализировано');
      } catch (error) {
        console.error('Ошибка при создании сокет-соединения:', error);
      }
    }
  }

  private stopSync() {
    console.log('Остановка синхронизации');
    
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('Сокет-соединение закрыто');
    }
  }

  // Настройка обработчиков событий сокета
  private setupSocketHandlers(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Соединение установлено');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });
    
    this.socket.on('disconnect', () => {
      console.log('Соединение разорвано');
      this.isConnected = false;
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
  }

  // Повторное подключение
  private reconnect(): void {
    if (this.reconnectAttempts >= 5) {
      console.error('Превышено число попыток переподключения');
      return;
    }
    
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    
    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Попытка переподключения ${this.reconnectAttempts}/5...`);
      this.initialize(this.appType);
    }, 2000 * Math.pow(1.5, this.reconnectAttempts));
  }

  // Уведомление подписчиков о событии
  notifySubscribers(eventType: SyncEventType, data: any): void {
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
  subscribeToProperty(propertyId: string, callback: (data: any) => void): () => void {
    if (!this.socket || !this.isConnected) {
      console.warn('Невозможно подписаться: нет соединения');
      return () => {};
    }
    
    this.socket.emit('subscribe-property', propertyId);
    
    const wrappedCallback = (data: any) => {
      if (data.propertyId === propertyId) {
        callback(data);
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

  // Подписка на чат
  subscribeToChat(chatId: string, callback: (message: any) => void): () => void {
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
      if (!this.socket || !this.isConnected) {
        reject(new Error('Невозможно отправить сообщение: нет соединения'));
        return;
      }
      
      this.socket.emit('send-message', { chatId, message }, (response: any) => {
        if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(true);
        }
      });
    });
  }

  // Публичный метод для добавления подписчика
  addSubscriber(eventType: SyncEventType, callback: Function): void {
    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Set());
    }
    
    this.subscriptions.get(eventType)?.add(callback);
    console.log(`Добавлен подписчик для события ${eventType}`);
  }

  // Публичный метод для удаления подписчика
  removeSubscriber(eventType: SyncEventType, callback: Function): void {
    const subscribers = this.subscriptions.get(eventType);
    if (subscribers) {
      subscribers.delete(callback);
      console.log(`Удален подписчик для события ${eventType}`);
    }
  }
}

// Экспортируем единственный экземпляр сервиса
export const syncService = new SyncService();

// Экспортируем по умолчанию
export default syncService; 