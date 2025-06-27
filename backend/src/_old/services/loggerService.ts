import winston from 'winston';
import { format } from 'winston';
import path from 'path';

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
    
    // Транспорт для ошибок
    new winston.transports.File({
        filename: path.join('logs', 'error.log'),
        level: 'error',
    }),
    
    // Транспорт для всех логов
    new winston.transports.File({ 
        filename: path.join('logs', 'all.log') 
    }),
];

// Создаем логгер
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format: logFormat,
    transports,
});

// Экспортируем логгер
export { logger };

// Создаем класс для работы с логгером
export class LoggerService {
    static error(message: string, meta?: any) {
        logger.error(message, { ...meta });
    }

    static warn(message: string, meta?: any) {
        logger.warn(message, { ...meta });
    }

    static info(message: string, meta?: any) {
        logger.info(message, { ...meta });
    }

    static http(message: string, meta?: any) {
        logger.http(message, { ...meta });
    }

    static debug(message: string, meta?: any) {
        logger.debug(message, { ...meta });
    }

    // Метод для логирования HTTP запросов
    static logHttpRequest(req: any, res: any, responseTime: number) {
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`;
        this.http(message, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            responseTime,
            userAgent: req.get('user-agent'),
            ip: req.ip,
        });
    }

    // Метод для логирования ошибок
    static logError(error: Error, req?: any) {
        this.error(error.message, {
            stack: error.stack,
            ...(req && {
                method: req.method,
                url: req.originalUrl,
                body: req.body,
                params: req.params,
                query: req.query,
                user: req.user,
            }),
        });
    }
} 