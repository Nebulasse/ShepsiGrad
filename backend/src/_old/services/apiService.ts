import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { syncService, SyncChannel } from './syncService';
import { logger } from './loggerService';

interface ApiServiceOptions {
  port?: number;
  enableCors?: boolean;
  allowedOrigins?: string[];
}

class ApiService {
  private app: express.Application;
  private port: number;
  private enableCors: boolean;
  private allowedOrigins: string[];
  private isInitialized: boolean = false;

  constructor(options: ApiServiceOptions = {}) {
    this.app = express();
    this.port = options.port || 4000;
    this.enableCors = options.enableCors !== false;
    this.allowedOrigins = options.allowedOrigins || ['*'];
  }

  // Инициализация сервиса API
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Настройка CORS
    if (this.enableCors) {
      const corsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          if (!origin || this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Не разрешено политикой CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-App-ID', 'X-Client-Version']
      };
      
      this.app.use(cors(corsOptions));
    }

    // Middleware для определения источника запроса
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const appId = req.headers['x-app-id'] as string;
      const clientVersion = req.headers['x-client-version'] as string;
      
      if (appId) {
        req.app.locals.appId = appId;
        req.app.locals.clientVersion = clientVersion;
        logger.debug(`Request from app: ${appId}, version: ${clientVersion}`);
      }
      
      next();
    });

    // Middleware для обработки JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Healthcheck эндпоинт
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Запуск сервера
    this.app.listen(this.port, () => {
      logger.info(`Unified API service running on port ${this.port}`);
      this.isInitialized = true;
    });
  }

  // Добавление маршрутов API
  addRoutes(routes: express.Router): void {
    this.app.use('/api', routes);
  }

  // Добавление WebSocket обработчика для реального времени
  setupWebsocketHandlers(server: any): void {
    const io = require('socket.io')(server, {
      cors: {
        origin: this.allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    // Обработка подключений клиентов
    io.on('connection', (socket: any) => {
      const appId = socket.handshake.query.appId;
      logger.info(`Socket connected: ${socket.id} from app: ${appId}`);

      // Аутентификация клиента
      socket.on('authenticate', (data: { token: string }) => {
        // Здесь можно добавить проверку токена
        const { token } = data;
        
        // После успешной аутентификации настраиваем слушателей событий
        this.setupSocketEventListeners(socket, appId);
      });

      // Отключение клиента
      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    // Настройка мостов между событиями синхронизации и WebSocket
    this.setupSyncEventBridges(io);
  }

  // Настройка слушателей событий для сокета
  private setupSocketEventListeners(socket: any, appId: string): void {
    // Чат
    socket.on('join-chat', (chatId: string) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave-chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('send-message', async (data: any) => {
      // Сохраняем сообщение и публикуем событие синхронизации
      const { chatId, message } = data;
      
      await syncService.publish(SyncChannel.CHAT_MESSAGE, 'new-message', {
        chatId,
        message,
        sender: appId
      });
    });

    // Подписка на обновления объектов недвижимости
    socket.on('subscribe-property', (propertyId: string) => {
      socket.join(`property:${propertyId}`);
    });

    // Подписка на уведомления
    socket.on('subscribe-notifications', (userId: string) => {
      socket.join(`notifications:${userId}`);
    });
  }

  // Настройка мостов между событиями синхронизации и WebSocket
  private setupSyncEventBridges(io: any): void {
    // Мост для сообщений чата
    syncService.subscribe(SyncChannel.CHAT_MESSAGE, (event: { payload: { chatId: string; message: any } }) => {
      const { chatId, message } = event.payload;
      io.to(`chat:${chatId}`).emit('new-message', message);
    });

    // Мост для обновлений объектов недвижимости
    syncService.subscribe(SyncChannel.PROPERTY_UPDATE, (event: { payload: { documentId: string; document: any; operationType: string } }) => {
      const { documentId, document, operationType } = event.payload;
      io.to(`property:${documentId}`).emit('property-update', {
        propertyId: documentId,
        data: document,
        operation: operationType
      });
    });

    // Мост для уведомлений
    syncService.subscribe(SyncChannel.NOTIFICATION, (event: { payload: { userId?: string; [key: string]: any } }) => {
      const notification = event.payload;
      if (notification.userId) {
        io.to(`notifications:${notification.userId}`).emit('new-notification', notification);
      }
    });

    // Мост для бронирований
    syncService.subscribe(SyncChannel.BOOKING_UPDATE, (event: { payload: { documentId: string; document?: { propertyId?: string; ownerId?: string; userId?: string }; operationType: string } }) => {
      const { documentId, document, operationType } = event.payload;
      
      // Уведомляем всех клиентов, подписанных на объект недвижимости
      if (document && document.propertyId) {
        io.to(`property:${document.propertyId}`).emit('booking-update', {
          bookingId: documentId,
          data: document,
          operation: operationType
        });
      }
      
      // Уведомляем владельца и арендатора
      if (document) {
        if (document.ownerId) {
          io.to(`notifications:${document.ownerId}`).emit('booking-update', {
            bookingId: documentId,
            data: document,
            operation: operationType
          });
        }
        
        if (document.userId) {
          io.to(`notifications:${document.userId}`).emit('booking-update', {
            bookingId: documentId,
            data: document,
            operation: operationType
          });
        }
      }
    });
  }
}

// Экспортируем единственный экземпляр сервиса
export const apiService = new ApiService(); 