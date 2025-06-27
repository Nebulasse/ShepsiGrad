"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
/**
 * Класс для представления ошибок API
 */
class ApiError extends Error {
    /**
     * Создание экземпляра ApiError
     * @param statusCode HTTP код ошибки
     * @param message Сообщение об ошибке
     * @param isOperational Флаг операционной ошибки (не критической)
     * @param errors Массив ошибок (опционально)
     */
    constructor(statusCode, message, isOperational = true, errors) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        // Для корректной работы instanceof с наследованием от Error
        Object.setPrototypeOf(this, ApiError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Создание ошибки Bad Request (400)
     * @param message Сообщение об ошибке
     * @param errors Массив ошибок (опционально)
     * @returns Экземпляр ApiError
     */
    static badRequest(message, errors) {
        return new ApiError(400, message, true, errors);
    }
    /**
     * Создание ошибки Unauthorized (401)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static unauthorized(message = 'Требуется аутентификация') {
        return new ApiError(401, message);
    }
    /**
     * Создание ошибки Forbidden (403)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static forbidden(message = 'Доступ запрещен') {
        return new ApiError(403, message);
    }
    /**
     * Создание ошибки Not Found (404)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static notFound(message = 'Ресурс не найден') {
        return new ApiError(404, message);
    }
    /**
     * Создание ошибки Conflict (409)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static conflict(message) {
        return new ApiError(409, message);
    }
    /**
     * Создание ошибки Internal Server Error (500)
     * @param message Сообщение об ошибке
     * @param isOperational Флаг операционной ошибки
     * @returns Экземпляр ApiError
     */
    static internal(message = 'Внутренняя ошибка сервера', isOperational = true) {
        return new ApiError(500, message, isOperational);
    }
}
exports.ApiError = ApiError;
exports.default = ApiError;
