"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleLogger = void 0;
const winston_1 = __importStar(require("winston"));
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
const logFormat = winston_1.format.combine(winston_1.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.format.colorize({ all: true }), winston_1.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Создаем транспорты для логов
const transports = [
    // Консольный транспорт
    new winston_1.default.transports.Console(),
    // Транспорт для файла с ошибками
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    // Транспорт для общего лога
    new winston_1.default.transports.File({ filename: 'logs/combined.log' }),
];
// Создаем логгер
const logger = winston_1.default.createLogger({
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
const getModuleLogger = (moduleName) => {
    return {
        ...logger,
        error: (message) => logger.error(`[${moduleName}] ${message}`),
        warn: (message) => logger.warn(`[${moduleName}] ${message}`),
        info: (message) => logger.info(`[${moduleName}] ${message}`),
        http: (message) => logger.http(`[${moduleName}] ${message}`),
        debug: (message) => logger.debug(`[${moduleName}] ${message}`),
    };
};
exports.getModuleLogger = getModuleLogger;
exports.default = logger;
