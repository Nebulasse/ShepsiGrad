import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';

const logger = getModuleLogger('Database');

// Создаем экземпляр DataSource
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.database.host,
  port: env.database.port,
  username: env.database.username,
  password: env.database.password,
  database: env.database.database,
  synchronize: env.app.isDev, // Автоматическая синхронизация только в режиме разработки
  logging: env.app.isDev,
  entities: [__dirname + '/../models/*.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  subscribers: [__dirname + '/subscribers/*.{js,ts}'],
  ssl: env.database.ssl ? { rejectUnauthorized: false } : false,
  // Если указан URL, используем его вместо отдельных параметров
  url: env.database.url
});

/**
 * Инициализация подключения к базе данных
 */
export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      logger.info('Инициализация подключения к базе данных...');
      await AppDataSource.initialize();
      logger.info('Подключение к базе данных успешно установлено');
    }
    return AppDataSource;
  } catch (error) {
    logger.error(`Ошибка подключения к базе данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    throw error;
  }
};

/**
 * Закрытие подключения к базе данных
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      logger.info('Закрытие подключения к базе данных...');
      await AppDataSource.destroy();
      logger.info('Подключение к базе данных закрыто');
    }
  } catch (error) {
    logger.error(`Ошибка при закрытии подключения к базе данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    throw error;
  }
};

// Для обратной совместимости
export const connectDB = initializeDatabase;
export const closeDB = closeDatabase; 