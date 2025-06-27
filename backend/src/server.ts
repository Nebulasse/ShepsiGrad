import { startServer } from './app';
import { getModuleLogger } from './utils/logger';
import { validateEnv } from './config/env';

const logger = getModuleLogger('Server');

// Проверка переменных окружения
try {
  validateEnv();
} catch (error) {
  if (error instanceof Error) {
    logger.error(`Ошибка валидации переменных окружения: ${error.message}`);
  } else {
    logger.error('Неизвестная ошибка при валидации переменных окружения');
  }
  process.exit(1);
}

// Запуск сервера
startServer()
  .then(() => {
    logger.info('Сервер успешно запущен');
  })
  .catch((error) => {
    if (error instanceof Error) {
      logger.error(`Ошибка запуска сервера: ${error.message}`);
    } else {
      logger.error('Неизвестная ошибка при запуске сервера');
    }
    process.exit(1);
  }); 