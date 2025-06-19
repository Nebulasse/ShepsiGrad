import winston from 'winston';
import { env } from '../config/env';

// Определение уровней логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Определение цветов для различных уровней логирования
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Добавление цветов для winston
winston.addColors(colors);

// Определение формата логов
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Создание инстанса логгера
const logger = winston.createLogger({
  level: env.logging.level,
  levels,
  format,
  transports: [
    new winston.transports.Console()
  ],
});

// Экспорт логгера
export default logger;

// Вспомогательная функция для создания специфического логгера для модуля
export const getModuleLogger = (moduleName: string) => {
  return {
    error: (message: string, meta?: any) => {
      logger.error(`[${moduleName}] ${message}`, meta);
    },
    warn: (message: string, meta?: any) => {
      logger.warn(`[${moduleName}] ${message}`, meta);
    },
    info: (message: string, meta?: any) => {
      logger.info(`[${moduleName}] ${message}`, meta);
    },
    http: (message: string, meta?: any) => {
      logger.http(`[${moduleName}] ${message}`, meta);
    },
    debug: (message: string, meta?: any) => {
      logger.debug(`[${moduleName}] ${message}`, meta);
    },
  };
}; 