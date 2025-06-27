"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_2 = require("winston");
const path_1 = __importDefault(require("path"));
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
winston_1.default.addColors(colors);
// Создаем формат для логов
const logFormat = winston_2.format.combine(winston_2.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_2.format.colorize({ all: true }), winston_2.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Создаем транспорты для логов
const transports = [
    // Консольный транспорт
    new winston_1.default.transports.Console(),
    // Транспорт для ошибок
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'error.log'),
        level: 'error',
    }),
    // Транспорт для всех логов
    new winston_1.default.transports.File({
        filename: path_1.default.join('logs', 'all.log')
    }),
];
// Создаем логгер
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format: logFormat,
    transports,
});
exports.logger = logger;
// Создаем класс для работы с логгером
class LoggerService {
    static error(message, meta) {
        logger.error(message, { ...meta });
    }
    static warn(message, meta) {
        logger.warn(message, { ...meta });
    }
    static info(message, meta) {
        logger.info(message, { ...meta });
    }
    static http(message, meta) {
        logger.http(message, { ...meta });
    }
    static debug(message, meta) {
        logger.debug(message, { ...meta });
    }
    // Метод для логирования HTTP запросов
    static logHttpRequest(req, res, responseTime) {
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
    static logError(error, req) {
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
exports.LoggerService = LoggerService;
