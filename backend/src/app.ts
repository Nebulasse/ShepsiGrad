import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import apiRoutes from './routes';
import { getModuleLogger } from './utils/logger';
import { createServer } from 'http';

const logger = getModuleLogger('App');

// Создание экземпляра приложения
const app: Express = express();
const httpServer = createServer(app);

// Применение middleware
app.use(helmet()); // Заголовки безопасности
app.use(compression()); // Сжатие ответов
app.use(cors({ origin: env.app.corsOrigin })); // CORS
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// Логирование запросов
if (env.app.isDev) {
  app.use(morgan('dev'));
}

// Эндпоинт для проверки работоспособности
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.app.environment,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  });
});

// API маршруты
app.use(env.app.apiPrefix, apiRoutes);

// Обработка 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Запрашиваемый ресурс не найден',
  });
});

// Обработка ошибок
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Ошибка приложения: ${err.message}`);
  logger.error(err.stack);

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: env.app.isDev ? err.message : undefined,
  });
});

// Запуск сервера
const startServer = async (): Promise<void> => {
  try {
    // Запуск сервера
    httpServer.listen(env.app.port, () => {
      logger.info(`Сервер запущен на порту ${env.app.port} в режиме ${env.app.environment}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Не удалось запустить сервер: ${error.message}`);
    } else {
      logger.error('Неизвестная ошибка при запуске сервера');
    }
    process.exit(1);
  }
};

// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
  logger.error('Необработанное исключение:', err);
  process.exit(1);
});

// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (reason) => {
  logger.error('Необработанное отклонение промиса:', reason);
});

// Обработка сигналов завершения
process.on('SIGTERM', () => {
  logger.info('Получен сигнал SIGTERM. Завершение работы сервера...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Получен сигнал SIGINT. Завершение работы сервера...');
  process.exit(0);
});

// Экспорт приложения и функции запуска
export { app, startServer };
export default httpServer; 