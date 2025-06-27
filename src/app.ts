import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { errorMiddleware, notFoundMiddleware } from './utils/errorHandler';
import { getModuleLogger } from './utils/logger';
import { AppDataSource } from './database/connection';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/userRoutes';
import propertyRoutes from './routes/propertyRoutes';
import reviewRoutes from './routes/reviewRoutes';
import bookingRoutes from './routes/bookingRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';
import { setupWebSocket } from './services/socketService';
import http from 'http';
import path from 'path';

const logger = getModuleLogger('App');

// Создаем экземпляр приложения Express
const app = express();
const server = http.createServer(app);

// Настройка WebSocket
setupWebSocket(server);

// Настраиваем middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Логирование запросов
if (config.app.environment !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim())
    }
  }));
}

// Префикс API
const apiPrefix = config.app.apiPrefix;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов с одного IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Слишком много запросов с вашего IP, пожалуйста, попробуйте позже'
});

// Применяем rate limiting к API маршрутам
app.use('/api', limiter);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public')));

// Маршруты API
app.use(`${apiPrefix}/health`, healthRoutes);
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/properties`, propertyRoutes);
app.use(`${apiPrefix}/reviews`, reviewRoutes);
app.use(`${apiPrefix}/bookings`, bookingRoutes);
app.use(`${apiPrefix}/favorites`, favoriteRoutes);
app.use(`${apiPrefix}/chats`, chatRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);

// Обработка 404
app.use(notFoundMiddleware);

// Обработка ошибок
app.use(errorMiddleware);

// Инициализация базы данных
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('База данных успешно инициализирована');
  } catch (error) {
    logger.error(`Ошибка при инициализации базы данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    process.exit(1);
  }
};

export { app, server }; 