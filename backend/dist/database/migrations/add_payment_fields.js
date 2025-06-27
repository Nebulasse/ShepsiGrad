"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const env_1 = require("../../config/env");
const logger_1 = require("../../utils/logger");
const logger = (0, logger_1.getModuleLogger)('Migration:AddPaymentFields');
async function runMigration() {
    // Настройка подключения к базе данных
    const sequelize = new sequelize_1.Sequelize(env_1.env.database.url ||
        `postgresql://${env_1.env.database.username}:${env_1.env.database.password}@${env_1.env.database.host}:${env_1.env.database.port}/${env_1.env.database.database}`, {
        dialect: 'postgres',
        logging: (msg) => logger.debug(msg),
        dialectOptions: {
            ssl: env_1.env.database.ssl ? {
                require: true,
                rejectUnauthorized: false
            } : undefined
        }
    });
    try {
        // Проверка соединения
        await sequelize.authenticate();
        logger.info('Соединение с базой данных установлено успешно');
        // Выполнение SQL-запросов
        logger.info('Добавление полей payment_id и refund_id в таблицу bookings');
        await sequelize.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);`);
        await sequelize.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);`);
        // Проверка существования типа booking_status
        const [typeExists] = await sequelize.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'booking_status'
      ) as exists;
    `);
        const enumTypeExists = typeExists[0].exists;
        if (enumTypeExists) {
            // Если тип существует, пробуем добавить значение
            logger.info('Тип booking_status существует, добавляем значение "refunded"');
            try {
                await sequelize.query(`ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'refunded';`);
                logger.info('Значение "refunded" успешно добавлено');
            }
            catch (error) {
                const err = error;
                logger.warn(`Не удалось добавить значение в enum: ${err.message}`);
                // Получаем текущие значения enum
                const [results] = await sequelize.query(`
          SELECT e.enumlabel 
          FROM pg_enum e 
          JOIN pg_type t ON e.enumtypid = t.oid 
          WHERE t.typname = 'booking_status'
        `);
                const enumValues = results.map((row) => row.enumlabel);
                logger.info(`Существующие значения enum booking_status: ${enumValues.join(', ')}`);
                if (!enumValues.includes('refunded')) {
                    logger.info('Пересоздание типа с добавленным значением "refunded"');
                    // Если значения нет, создаем новый тип с добавленным значением
                    await sequelize.query(`
            ALTER TABLE bookings 
            ALTER COLUMN status TYPE VARCHAR(255);
            
            DROP TYPE IF EXISTS booking_status;
            
            CREATE TYPE booking_status AS ENUM (${enumValues.map((v) => `'${v}'`).join(', ')}, 'refunded');
            
            ALTER TABLE bookings 
            ALTER COLUMN status TYPE booking_status USING status::booking_status;
          `);
                }
            }
        }
        else {
            // Если тип не существует, создаем его с нужными значениями
            logger.info('Тип booking_status не существует, создаем его');
            // Проверяем существование колонки status в таблице bookings
            const [columnExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'bookings' AND column_name = 'status'
        ) as exists;
      `);
            const hasStatusColumn = columnExists[0].exists;
            // Базовые статусы бронирования
            const baseStatuses = ['pending', 'confirmed', 'cancelled', 'completed', 'refunded'];
            if (hasStatusColumn) {
                // Если колонка существует, конвертируем ее в VARCHAR, создаем тип и затем конвертируем обратно
                await sequelize.query(`
          ALTER TABLE bookings 
          ALTER COLUMN status TYPE VARCHAR(255);
          
          CREATE TYPE booking_status AS ENUM ('${baseStatuses.join("', '")}');
          
          ALTER TABLE bookings 
          ALTER COLUMN status TYPE booking_status USING status::booking_status;
        `);
            }
            else {
                // Если колонки нет, просто создаем тип
                await sequelize.query(`CREATE TYPE booking_status AS ENUM ('${baseStatuses.join("', '")}');`);
            }
            logger.info('Тип booking_status успешно создан');
        }
        logger.info('Миграция успешно выполнена');
    }
    catch (error) {
        const err = error;
        logger.error(`Ошибка при выполнении миграции: ${err.message}`);
        throw error;
    }
    finally {
        await sequelize.close();
    }
}
// Запуск миграции
runMigration()
    .then(() => {
    console.log('Миграция успешно завершена');
    process.exit(0);
})
    .catch((error) => {
    console.error('Ошибка при выполнении миграции:', error);
    process.exit(1);
});
