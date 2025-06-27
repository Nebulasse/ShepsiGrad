import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';

const logger = getModuleLogger('Database');

// Настройка параметров подключения к базе данных
const sequelize = new Sequelize(
  // Если предоставлен полный URL для подключения, используем его
  env.database.url || 
  // Иначе собираем URL из отдельных параметров
  `postgresql://${env.database.username}:${env.database.password}@${env.database.host}:${env.database.port}/${env.database.database}`,
  {
    dialect: 'postgres',
    logging: env.app.environment === 'development' ? (msg) => logger.debug(msg) : false,
    dialectOptions: {
      ssl: env.database.ssl ? {
        require: true,
        rejectUnauthorized: false // для самоподписанных сертификатов
      } : undefined
    },
    pool: {
      max: 10, // максимальное количество соединений в пуле
      min: 0, // минимальное количество соединений в пуле
      acquire: 30000, // максимальное время в мс, которое пул будет пытаться получить соединение
      idle: 10000 // максимальное время в мс, в течение которого соединение может быть неактивным
    },
    define: {
      timestamps: true, // добавление полей createdAt и updatedAt
      underscored: true, // использование snake_case для полей
    }
  }
);

// Функция для инициализации соединения с базой данных
export const initDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Соединение с базой данных установлено успешно');

    // В режиме разработки синхронизируем модели с базой данных
    if (env.app.environment === 'development' && process.env.SYNC_DB === 'true') {
      logger.info('Синхронизация моделей с базой данных...');
      await sequelize.sync({ alter: true });
      logger.info('Синхронизация моделей с базой данных завершена');
    }
  } catch (error) {
    logger.error(`Ошибка при подключении к базе данных: ${error.message}`);
    throw error;
  }
};

export default sequelize; 