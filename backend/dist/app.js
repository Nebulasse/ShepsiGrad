"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./utils/logger");
const http_1 = require("http");
const logger = (0, logger_1.getModuleLogger)('App');
// Создание экземпляра приложения
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Применение middleware
app.use((0, helmet_1.default)()); // Заголовки безопасности
app.use((0, compression_1.default)()); // Сжатие ответов
app.use((0, cors_1.default)({ origin: env_1.env.app.corsOrigin })); // CORS
app.use(express_1.default.json()); // Парсинг JSON
app.use(express_1.default.urlencoded({ extended: true })); // Парсинг URL-encoded данных
// Логирование запросов
if (env_1.env.app.isDev) {
    app.use((0, morgan_1.default)('dev'));
}
// Эндпоинт для проверки работоспособности
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.env.app.environment,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime()
    });
});
// API маршруты
app.use(env_1.env.app.apiPrefix, routes_1.default);
// Обработка 404
app.use((req, res) => {
    res.status(404).json({
        message: 'Запрашиваемый ресурс не найден',
    });
});
// Обработка ошибок
app.use((err, req, res, next) => {
    logger.error(`Ошибка приложения: ${err.message}`);
    logger.error(err.stack);
    res.status(500).json({
        message: 'Внутренняя ошибка сервера',
        error: env_1.env.app.isDev ? err.message : undefined,
    });
});
// Запуск сервера
const startServer = async () => {
    try {
        // Запуск сервера
        httpServer.listen(env_1.env.app.port, () => {
            logger.info(`Сервер запущен на порту ${env_1.env.app.port} в режиме ${env_1.env.app.environment}`);
        });
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`Не удалось запустить сервер: ${error.message}`);
        }
        else {
            logger.error('Неизвестная ошибка при запуске сервера');
        }
        process.exit(1);
    }
};
exports.startServer = startServer;
// Обработка необработанных исключений
process.on('uncaughtException', (err) => {
    logger.error('Необработанное исключение:', err);
    process.exit(1);
});
// Обработка необработанных отклонений промисов
process.on('unhandledRejection', (reason) => {
    logger.error('Необработанное отклонение промиса:', reason);
});
// Обработка сигналов завершения
process.on('SIGTERM', () => {
    logger.info('Получен сигнал SIGTERM. Завершение работы сервера...');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger.info('Получен сигнал SIGINT. Завершение работы сервера...');
    process.exit(0);
});
exports.default = httpServer;
