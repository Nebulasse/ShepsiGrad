import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verify } from 'jsonwebtoken';
import { UserModel } from '../models/User';

interface SocketUser {
  userId: string;
  socketId: string;
}

export class SocketService {
  private io: Server;
  private connectedUsers: Map<string, SocketUser> = new Map();

  constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Требуется авторизация'));
        }

        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
        const user = await UserModel.findById(decoded.id);

        if (!user) {
          return next(new Error('Пользователь не найден'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Ошибка аутентификации'));
      }
    });

    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`Пользователь подключился: ${user.id}`);

      // Сохраняем информацию о подключенном пользователе
      this.connectedUsers.set(user.id, {
        userId: user.id,
        socketId: socket.id
      });

      // Обработка личных сообщений
      socket.on('private_message', async (data: { to: string; message: string }) => {
        const recipient = this.connectedUsers.get(data.to);
        if (recipient) {
          this.io.to(recipient.socketId).emit('private_message', {
            from: user.id,
            message: data.message,
            timestamp: new Date()
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
        }
      });

      // Обработка отключения
      socket.on('disconnect', () => {
        console.log(`Пользователь отключился: ${user.id}`);
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
    }
  }

  // Метод для отправки сообщения конкретному пользователю
  public sendPrivateMessage(from: string, to: string, message: string) {
    const recipient = this.connectedUsers.get(to);
    if (recipient) {
      this.io.to(recipient.socketId).emit('private_message', {
        from,
        message,
        timestamp: new Date()
      });
    }
  }

  // Метод для отправки сообщения всем пользователям
  public broadcastMessage(message: string, excludeUserId?: string) {
    this.io.emit('broadcast_message', {
      message,
      timestamp: new Date()
    });
  }
} 