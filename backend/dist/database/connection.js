"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = void 0;
const sequelize_1 = require("sequelize");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getModuleLogger)('Database');
// Настройка параметров подключения к базе данных
const sequelize = new sequelize_1.Sequelize(
// Если предоставлен полный URL для подключения, используем его
env_1.env.database.url ||
    // Иначе собираем URL из отдельных параметров
    `postgresql://${env_1.env.database.username}:${env_1.env.database.password}@${env_1.env.database.host}:${env_1.env.database.port}/${env_1.env.database.database}`, {
    dialect: 'postgres',
    logging: env_1.env.app.environment === 'development' ? (msg) => logger.debug(msg) : false,
    dialectOptions: {
        ssl: env_1.env.database.ssl ? {
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
});
// Функция для инициализации соединения с базой данных
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Соединение с базой данных установлено успешно');
        // В режиме разработки синхронизируем модели с базой данных
        if (env_1.env.app.environment === 'development' && process.env.SYNC_DB === 'true') {
            logger.info('Синхронизация моделей с базой данных...');
            await sequelize.sync({ alter: true });
            logger.info('Синхронизация моделей с базой данных завершена');
        }
    }
    catch (error) {
        logger.error(`Ошибка при подключении к базе данных: ${error.message}`);
        throw error;
    }
};
exports.initDatabase = initDatabase;
exports.default = sequelize;
