import http from 'http';
import app from './app';
import { config, validateSyncConfig } from './config/appConfig';
import { syncService, SyncChannel } from './services/syncService';
import { apiService } from './services/apiService';
import mongoose from 'mongoose';
import { logger } from './services/loggerService';
import Property from './models/Property';
import Chat from './models/Chat';
import Notification from './models/Notification';
import Booking from './models/Booking';
import User from './models/User';
import Favorite from './models/Favorite';

// Проверяем конфигурацию синхронизации
if (!validateSyncConfig()) {
  process.exit(1);
}

// Подключение к базе данных
mongoose.connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info('Подключение к MongoDB успешно установлено');
    startServer();
  })
  .catch((error) => {
    logger.error('Ошибка подключения к MongoDB:', error);
    process.exit(1);
  });

async function startServer() {
  try {
    const PORT = config.port;
    
    // Создаем HTTP сервер на основе Express приложения
    const server = http.createServer(app);
    
    // Инициализируем единый API сервис
    await apiService.initialize();
    
    // Если синхронизация включена, настраиваем WebSocket и связываем модели
    if (config.sync.enabled) {
      logger.info(`Запуск синхронизации в режиме: ${config.sync.mode}`);
      
      // Настройка WebSocket обработчиков
      apiService.setupWebsocketHandlers(server);
      
      // Настройка синхронизации моделей
      await syncService.setupModelSync(Property, SyncChannel.PROPERTY_UPDATE);
      await syncService.setupModelSync(Chat, SyncChannel.CHAT_MESSAGE);
      await syncService.setupModelSync(Notification, SyncChannel.NOTIFICATION);
      await syncService.setupModelSync(Booking, SyncChannel.BOOKING_UPDATE);
      await syncService.setupModelSync(User, SyncChannel.USER_UPDATE);
      await syncService.setupModelSync(Favorite, SyncChannel.FAVORITE_UPDATE);
      
      logger.info('Синхронизация моделей настроена успешно');
    }
    
    // Запуск сервера
    server.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT} в режиме ${config.env}`);
      logger.info(`ID приложения: ${config.sync.appId}, тип: ${config.sync.appType}`);
    });
    
    // Обработка сигналов завершения
    process.on('SIGTERM', () => {
      logger.info('SIGTERM получен. Закрытие сервера...');
      server.close(() => {
        logger.info('Сервер закрыт');
        mongoose.connection.close(false, () => {
          logger.info('Соединение с MongoDB закрыто');
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
} 