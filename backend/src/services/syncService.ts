import { PubSub } from 'graphql-subscriptions';
import mongoose from 'mongoose';
import { logger } from './loggerService';

// Каналы для различных типов синхронизации
export enum SyncChannel {
  PROPERTY_UPDATE = 'PROPERTY_UPDATE',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  NOTIFICATION = 'NOTIFICATION',
  BOOKING_UPDATE = 'BOOKING_UPDATE',
  USER_UPDATE = 'USER_UPDATE',
  FAVORITE_UPDATE = 'FAVORITE_UPDATE'
}

// Тип для передачи данных событий
export interface SyncEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
  targetApps?: string[];
}

// Типы для различных событий синхронизации
export interface DocumentSyncPayload {
  documentId: string;
  document: any;
  operationType: string;
}

export interface ChatMessagePayload {
  chatId: string;
  message: any;
}

export interface NotificationPayload {
  userId?: string;
  [key: string]: any;
}

class SyncService {
  private pubsub: PubSub;
  private applicationId: string;

  constructor() {
    this.pubsub = new PubSub();
    // Уникальный идентификатор для текущего экземпляра приложения
    this.applicationId = process.env.APP_ID || `app-${Math.random().toString(36).substr(2, 9)}`;
    
    logger.info(`SyncService initialized with appId: ${this.applicationId}`);
  }

  // Публикация события синхронизации
  async publish<T>(channel: SyncChannel, type: string, payload: T, targetApps?: string[]): Promise<void> {
    const syncEvent: SyncEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
      source: this.applicationId,
      targetApps
    };

    await this.pubsub.publish(channel, { [channel]: syncEvent });
    logger.debug(`Published to ${channel}: ${type}`, { source: this.applicationId });
  }

  // Подписка на события синхронизации
  subscribe<T>(channel: SyncChannel, callback: (event: SyncEvent<T>) => void): () => void {
    const asyncIterator = this.pubsub.asyncIterator<{ [key: string]: SyncEvent<T> }>([channel]);
    
    // Обработка событий из итератора
    const handleEvents = async () => {
      try {
        for await (const event of asyncIterator) {
          const syncEvent = event[channel] as SyncEvent<T>;
          
          // Пропускаем события от текущего приложения
          if (syncEvent.source === this.applicationId) {
            continue;
          }
          
          // Проверяем, предназначено ли событие для этого приложения
          if (syncEvent.targetApps && !syncEvent.targetApps.includes(this.applicationId)) {
            continue;
          }
          
          callback(syncEvent);
        }
      } catch (error) {
        logger.error('Error in sync event processing:', error instanceof Error ? error.message : 'Unknown error');
      }
    };
    
    // Запускаем обработку в фоновом режиме
    handleEvents().catch(err => {
      logger.error('Error in sync subscription:', err instanceof Error ? err.message : 'Unknown error');
    });
    
    // Возвращаем функцию для отписки
    return () => {
      this.pubsub.unsubscribe(asyncIterator);
    };
  }

  // Метод для синхронизации моделей MongoDB
  async setupModelSync<T extends mongoose.Document>(
    model: mongoose.Model<T>,
    channel: SyncChannel,
  ): Promise<void> {
    // Настраиваем обработчики событий MongoDB для публикации изменений
    model.watch().on('change', async (change) => {
      const operationType = change.operationType;
      const documentId = change.documentKey._id;
      
      // Получаем актуальные данные документа для операций, которые их изменяют
      let document = null;
      if (['insert', 'update', 'replace'].includes(operationType)) {
        document = await model.findById(documentId).lean();
      }
      
      // Публикуем событие синхронизации
      await this.publish<DocumentSyncPayload>(channel, operationType, {
        documentId,
        document,
        operationType
      });
    });
    
    // Подписываемся на события синхронизации от других экземпляров
    this.subscribe<DocumentSyncPayload>(channel, async (event) => {
      const { documentId, document, operationType } = event.payload;
      
      try {
        switch (operationType) {
          case 'insert':
          case 'replace':
            if (document) {
              await model.findByIdAndUpdate(documentId, document, { upsert: true });
            }
            break;
          case 'update':
            if (document) {
              await model.findByIdAndUpdate(documentId, document);
            }
            break;
          case 'delete':
            await model.findByIdAndDelete(documentId);
            break;
        }
      } catch (error) {
        logger.error(`Error syncing ${model.modelName}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    });
  }
}

// Экспортируем единственный экземпляр сервиса
export const syncService = new SyncService(); 