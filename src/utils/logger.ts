import winston from 'winston';
import { env } from '../config/env';
import path from 'path';

// Форматирование логов
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Консольный транспорт для логов
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, moduleName, ...meta }) => {
      return `${timestamp} ${level} [${moduleName || 'App'}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  )
});

// Транспорты для логов
const transports: winston.transport[] = [consoleTransport];

// Добавляем файловый транспорт, если указан путь к файлу логов
if (env.logging.filePath) {
  const logDir = path.dirname(env.logging.filePath);
  const fileName = path.basename(env.logging.filePath);

  // Транспорт для всех логов
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, fileName),
      format: logFormat
    })
  );

  // Транспорт только для ошибок
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: logFormat
    })
  );
}

// Создаем логгер
const logger = winston.createLogger({
  level: env.logging.level || 'info',
  format: logFormat,
  defaultMeta: { service: 'rental-service' },
  transports
});

/**
 * Получить логгер для конкретного модуля
 * @param moduleName Имя модуля
 */
export const getModuleLogger = (moduleName: string) => {
  return {
    info: (message: string, meta: Record<string, any> = {}) => {
      logger.info(message, { moduleName, ...meta });
    },
    warn: (message: string, meta: Record<string, any> = {}) => {
      logger.warn(message, { moduleName, ...meta });
    },
    error: (message: string, meta: Record<string, any> = {}) => {
      logger.error(message, { moduleName, ...meta });
    },
    debug: (message: string, meta: Record<string, any> = {}) => {
      logger.debug(message, { moduleName, ...meta });
    }
  };
};

// Экспортируем основной логгер для прямого использования
export default logger; 