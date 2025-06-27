import { app, server, initializeDatabase } from './app';
import { config } from './config/env';
import { getModuleLogger } from './utils/logger';

const logger = getModuleLogger('Server');
const PORT = config.app.port;

// Запускаем сервер
const startServer = async (): Promise<void> => {
  try {
    // Инициализируем базу данных
    await initializeDatabase();

    // Запускаем HTTP сервер
    server.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT} в режиме ${config.app.environment}`);
      logger.info(`API доступно по адресу: http://localhost:${PORT}${config.app.apiPrefix}`);
    });

    // Обработка сигналов завершения
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error: unknown) {
    logger.error(`Ошибка запуска сервера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    process.exit(1);
  }
};

// Функция для корректного завершения работы сервера
const gracefulShutdown = (): void => {
  logger.info('Получен сигнал завершения работы, закрываем соединения...');
  
  server.close(() => {
    logger.info('HTTP сервер закрыт');
    process.exit(0);
  });

  // Если сервер не закрылся за 10 секунд, принудительно завершаем процесс
  setTimeout(() => {
    logger.error('Не удалось корректно закрыть соединения, принудительное завершение');
    process.exit(1);
  }, 10000);
};

// Запускаем сервер
startServer();

export default server; 