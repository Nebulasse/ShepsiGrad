import winston, { format, Logger } from 'winston';

// Определяем уровни логирования
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Определяем цвета для разных уровней
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Добавляем цвета в winston
winston.addColors(colors);

// Создаем формат для логов
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  format.colorize({ all: true }),
  format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Создаем транспорты для логов
const transports = [
  // Консольный транспорт
  new winston.transports.Console(),
  
  // Транспорт для файла с ошибками
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  
  // Транспорт для общего лога
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Создаем логгер
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format: logFormat,
  transports,
});

/**
 * Получить логгер для конкретного модуля
 * @param moduleName Имя модуля
 * @returns Экземпляр логгера
 */
export const getModuleLogger = (moduleName: string): Logger => {
  return {
    ...logger,
    error: (message: string) => logger.error(`[${moduleName}] ${message}`),
    warn: (message: string) => logger.warn(`[${moduleName}] ${message}`),
    info: (message: string) => logger.info(`[${moduleName}] ${message}`),
    http: (message: string) => logger.http(`[${moduleName}] ${message}`),
    debug: (message: string) => logger.debug(`[${moduleName}] ${message}`),
  } as Logger;
};

export default logger; 