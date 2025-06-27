"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const logger_1 = require("./utils/logger");
const logger = (0, logger_1.getModuleLogger)('Main');
// Запуск сервера
(0, app_1.startServer)()
    .then(() => {
    logger.info('Сервер запущен успешно');
})
    .catch((error) => {
    logger.error(`Не удалось запустить сервер: ${error.message}`);
    process.exit(1);
});
