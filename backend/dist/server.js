"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const env_1 = require("./config/env");
const logger = (0, logger_1.getModuleLogger)('Server');
// Проверка переменных окружения
try {
    (0, env_1.validateEnv)();
}
catch (error) {
    if (error instanceof Error) {
        logger.error(`Ошибка валидации переменных окружения: ${error.message}`);
    }
    else {
        logger.error('Неизвестная ошибка при валидации переменных окружения');
    }
    process.exit(1);
}
// Запуск сервера
(0, app_1.startServer)()
    .then(() => {
    logger.info('Сервер успешно запущен');
})
    .catch((error) => {
    if (error instanceof Error) {
        logger.error(`Ошибка запуска сервера: ${error.message}`);
    }
    else {
        logger.error('Неизвестная ошибка при запуске сервера');
    }
    process.exit(1);
});
