"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = exports.requestLogger = void 0;
const loggerService_1 = require("../services/loggerService");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Логируем запрос
    loggerService_1.LoggerService.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        user: req.user,
    });
    // Перехватываем ответ
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        loggerService_1.LoggerService.logHttpRequest(req, res, responseTime);
    });
    next();
};
exports.requestLogger = requestLogger;
const errorLogger = (err, req, res, next) => {
    loggerService_1.LoggerService.logError(err, req);
    next(err);
};
exports.errorLogger = errorLogger;
