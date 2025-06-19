import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use(this.authenticateSocket.bind(this));

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.userId) return;

      console.log(`Пользователь подключен: ${socket.userId}`);
      this.connectedUsers.set(socket.userId, socket);

      // Обработка приватных сообщений
      socket.on('private_message', async (data) => {
        try {
          const { to, message, timestamp } = data;
          
          // Сохранение сообщения в базе данных
          const { error } = await supabase
            .from('messages')
            .insert({
              from: socket.userId,
              to,
              message,
              timestamp,
              property_id: data.propertyId
            });

          if (error) throw error;

          // Отправка сообщения получателю, если он онлайн
          const recipientSocket = this.connectedUsers.get(to);
          if (recipientSocket) {
            recipientSocket.emit('private_message', {
              from: socket.userId,
              message,
              timestamp
            });
          }
        } catch (error) {
          console.error('Ошибка при отправке сообщения:', error);
          socket.emit('error', { message: 'Ошибка при отправке сообщения' });
        }
      });

      // Обработка уведомлений
      socket.on('notification', async (data) => {
        try {
          const { userId, notification } = data;
          
          // Сохранение уведомления в базе данных
          const { error } = await supabase
            .from('notifications')
            .insert({
              user_id: userId,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              timestamp: notification.timestamp,
              property_id: notification.propertyId,
              booking_id: notification.bookingId
            });

          if (error) throw error;

          // Отправка уведомления пользователю, если он онлайн
          const recipientSocket = this.connectedUsers.get(userId);
          if (recipientSocket) {
            recipientSocket.emit('notification', notification);
          }
        } catch (error) {
          console.error('Ошибка при отправке уведомления:', error);
          socket.emit('error', { message: 'Ошибка при отправке уведомления' });
        }
      });

      // Обработка отключения
      socket.on('disconnect', () => {
        if (socket.userId) {
          console.log(`Пользователь отключен: ${socket.userId}`);
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  private async authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        throw new Error('Токен не предоставлен');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        userId: string;
        role: string;
      };

      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Ошибка аутентификации'));
    }
  }

  // Метод для отправки уведомления всем арендодателям
  public async notifyAllLandlords(notification: any) {
    try {
      const { data: landlords, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'landlord');

      if (error) throw error;

      landlords?.forEach(landlord => {
        const socket = this.connectedUsers.get(landlord.id);
        if (socket) {
          socket.emit('notification', notification);
        }
      });
    } catch (error) {
      console.error('Ошибка при отправке уведомлений арендодателям:', error);
    }
  }
} 