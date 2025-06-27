import { API_CONFIG } from '../config';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// Каналы синхронизации, соответствующие бэкенду
export enum SyncChannel {
  PROPERTY_UPDATE = 'PROPERTY_UPDATE',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  NOTIFICATION = 'NOTIFICATION',
  BOOKING_UPDATE = 'BOOKING_UPDATE',
  USER_UPDATE = 'USER_UPDATE',
  FAVORITE_UPDATE = 'FAVORITE_UPDATE'
}

// Тип для событий синхронизации
export interface SyncEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
  targetApps?: string[];
}

// Тип для обработчиков событий
type EventHandler<T = any> = (event: SyncEvent<T>) => void;

class SyncService {
  private socket: Socket | null = null;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private applicationId: string = 'landlord-app';
  private isConnected: boolean = false;

  // Инициализация сервиса синхронизации
  async initialize(): Promise<void> {
    try {
      // Получаем токен доступа
      const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
      
      if (!token) {
        console.log('Токен не найден, синхронизация не будет работать');
        return;
      }

      // Создаем сокет-соединение
      this.socket = io(`${API_CONFIG.baseUrl}/sync`, {
        auth: {
          token,
          appId: this.applicationId,
          appType: 'landlord'
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Настраиваем обработчики событий сокета
      this.socket.on('connect', this.handleConnect);
      this.socket.on('disconnect', this.handleDisconnect);
      this.socket.on('error', this.handleError);
      this.socket.on('sync_event', this.handleSyncEvent);

      // Подписываемся на все каналы синхронизации
      Object.values(SyncChannel).forEach(channel => {
        this.socket?.on(channel, (event: SyncEvent) => {
          this.notifyHandlers(channel, event);
        });
      });

      console.log('Сервис синхронизации инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации сервиса синхронизации:', error);
    }
  }

  // Обработчик подключения
  private handleConnect = () => {
    console.log('Соединение с сервером синхронизации установлено');
    this.isConnected = true;
  };

  // Обработчик отключения
  private handleDisconnect = (reason: string) => {
    console.log('Соединение с сервером синхронизации разорвано:', reason);
    this.isConnected = false;
  };

  // Обработчик ошибок
  private handleError = (error: Error) => {
    console.error('Ошибка сервера синхронизации:', error);
  };

  // Обработчик событий синхронизации
  private handleSyncEvent = (event: SyncEvent) => {
    // Игнорируем события от текущего приложения
    if (event.source === this.applicationId) {
      return;
    }

    // Проверяем, предназначено ли событие для этого приложения
    if (event.targetApps && !event.targetApps.includes(this.applicationId)) {
      return;
    }

    // Уведомляем всех подписчиков
    this.notifyHandlers('sync_event', event);
  };

  // Уведомление всех обработчиков о событии
  private notifyHandlers(channel: string, event: SyncEvent) {
    const handlers = this.handlers.get(channel);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Ошибка в обработчике события ${channel}:`, error);
        }
      });
    }
  }

  // Подписка на канал синхронизации
  subscribe<T>(channel: SyncChannel | 'sync_event', handler: EventHandler<T>): () => void {
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
    }
    
    const handlers = this.handlers.get(channel)!;
    handlers.add(handler as EventHandler);
    
    // Возвращаем функцию для отписки
    return () => {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.handlers.delete(channel);
      }
    };
  }

  // Отправка события синхронизации
  publish<T>(channel: SyncChannel, type: string, payload: T, targetApps?: string[]): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Невозможно отправить событие: нет соединения');
      return;
    }

    const event: SyncEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source: this.applicationId,
      targetApps
    };

    this.socket.emit(channel, event);
  }

  // Закрытие соединения
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.handlers.clear();
    }
  }

  // Проверка состояния соединения
  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

// Экспортируем единственный экземпляр сервиса
export const syncService = new SyncService();

// Хук для использования синхронизации в компонентах
export const useSyncService = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initSync = async () => {
      await syncService.initialize();
      setIsInitialized(true);
    };

    initSync();

    return () => {
      syncService.disconnect();
    };
  }, []);

  return {
    syncService,
    isInitialized,
    subscribe: syncService.subscribe.bind(syncService),
    publish: syncService.publish.bind(syncService),
  };
}; 