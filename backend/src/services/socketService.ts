import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verify } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { LoggerService } from './loggerService';

interface SocketUser {
  userId: string;
  socketId: string;
  appType: 'tenant' | 'landlord';
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: '*', // Разрешаем подключения с любого источника
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const appType = socket.handshake.auth.appType || 'tenant';

        if (!token) {
          return next(new Error('Требуется авторизация'));
        }

        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
        const user = await UserModel.findById(decoded.id);

        if (!user) {
          return next(new Error('Пользователь не найден'));
        }

        socket.data.user = user;
        socket.data.appType = appType;
        
        LoggerService.info(`WebSocket: пользователь авторизован`, { 
          userId: user.id, 
          appType 
        });
        
        next();
      } catch (error) {
        LoggerService.error('WebSocket: ошибка аутентификации', { error });
        next(new Error('Ошибка аутентификации'));
      }
    });

    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      const appType = socket.data.appType;
      
      LoggerService.info(`WebSocket: пользователь подключился`, { 
        userId: user.id, 
        appType 
      });

      // Сохраняем информацию о подключенном пользователе
      this.connectedUsers.set(user.id, {
        userId: user.id,
        socketId: socket.id,
        appType
      });

      // Обработка личных сообщений
      socket.on('private_message', async (data: { to: string; message: string; propertyId?: string }) => {
        const recipient = this.connectedUsers.get(data.to);
        if (recipient) {
          this.io.to(recipient.socketId).emit('private_message', {
            from: user.id,
            message: data.message,
            propertyId: data.propertyId,
            timestamp: new Date()
          });
          
          LoggerService.info(`WebSocket: отправлено личное сообщение`, { 
            from: user.id, 
            to: data.to, 
            propertyId: data.propertyId 
          });
        }
      });

      // Обработка уведомлений
      socket.on('notification', async (data: { to: string; type: string; content: any }) => {
        const recipient = this.connectedUsers.get(data.to);
        if (recipient) {
          this.io.to(recipient.socketId).emit('notification', {
            from: user.id,
            type: data.type,
            content: data.content,
            timestamp: new Date()
          });
          
          LoggerService.info(`WebSocket: отправлено уведомление`, { 
            from: user.id, 
            to: data.to, 
            type: data.type 
          });
        }
      });

      // Обработка отключения
      socket.on('disconnect', () => {
        LoggerService.info(`WebSocket: пользователь отключился`, { 
          userId: user.id, 
          appType 
        });
        this.connectedUsers.delete(user.id);
      });
    });
  }

  // Метод для отправки уведомления конкретному пользователю
  public sendNotification(userId: string, type: string, content: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io.to(user.socketId).emit('notification', {
        type,
        content,
        timestamp: new Date()
      });
      
      LoggerService.info(`WebSocket: отправлено уведомление через API`, { 
        to: userId, 
        type 
      });
    }
  }

  // Метод для отправки сообщения конкретному пользователю
  public sendPrivateMessage(from: string, to: string, message: string, propertyId?: string) {
    const recipient = this.connectedUsers.get(to);
    if (recipient) {
      this.io.to(recipient.socketId).emit('private_message', {
        from,
        message,
        propertyId,
        timestamp: new Date()
      });
      
      LoggerService.info(`WebSocket: отправлено личное сообщение через API`, { 
        from, 
        to, 
        propertyId 
      });
    }
  }

  // Метод для отправки сообщения всем пользователям определенного типа
  public broadcastMessage(message: string, appType?: 'tenant' | 'landlord') {
    if (appType) {
      // Находим всех пользователей указанного типа
      const targetSockets = Array.from(this.connectedUsers.values())
        .filter(user => user.appType === appType)
        .map(user => user.socketId);
      
      // Отправляем сообщение только этим пользователям
      this.io.to(targetSockets).emit('broadcast_message', {
        message,
        timestamp: new Date()
      });
      
      LoggerService.info(`WebSocket: отправлено широковещательное сообщение`, { 
        appType, 
        recipientCount: targetSockets.length 
      });
    } else {
      // Отправляем всем
      this.io.emit('broadcast_message', {
        message,
        timestamp: new Date()
      });
      
      LoggerService.info(`WebSocket: отправлено широковещательное сообщение всем пользователям`);
    }
  }
  
  // Получить список подключенных пользователей
  public getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }
} 