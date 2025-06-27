"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const validation_1 = require("../utils/validation");
const loggerService_1 = require("../services/loggerService");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Логируем ошибку
    loggerService_1.LoggerService.logError(err, req);
    if (err instanceof validation_1.ValidationError) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Обработка ошибок Supabase
    if (err.name === 'PostgrestError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Database error'
        });
    }
    // Неизвестные ошибки
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    loggerService_1.LoggerService.warn(`Route not found: ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
};
exports.notFoundHandler = notFoundHandler;
