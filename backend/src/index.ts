import { startServer } from './app';
import { getModuleLogger } from './utils/logger';

const logger = getModuleLogger('Main');

// Запуск сервера
startServer()
  .then(() => {
    logger.info('Сервер запущен успешно');
  })
  .catch((error) => {
    logger.error(`Не удалось запустить сервер: ${error.message}`);
    process.exit(1);
  }); 