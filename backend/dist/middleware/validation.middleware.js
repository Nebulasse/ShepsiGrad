"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.validateQuery = exports.validateParams = exports.validateBody = void 0;
const logger_1 = require("../utils/logger");
const express_validator_1 = require("express-validator");
const logger = (0, logger_1.getModuleLogger)('ValidationMiddleware');
/**
 * Middleware для валидации тела запроса
 * @param schema Joi схема для валидации
 */
const validateBody = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            logger.warn(`Ошибка валидации тела запроса: ${errorMessage}`);
            res.status(400).json({
                message: 'Ошибка валидации',
                errors: error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
            return;
        }
        // Заменяем тело запроса валидированными данными
        req.body = value;
        next();
    };
};
exports.validateBody = validateBody;
/**
 * Middleware для валидации параметров запроса
 * @param schema Joi схема для валидации
 */
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            logger.warn(`Ошибка валидации параметров запроса: ${errorMessage}`);
            res.status(400).json({
                message: 'Ошибка валидации',
                errors: error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
            return;
        }
        // Заменяем параметры запроса валидированными данными
        req.params = value;
        next();
    };
};
exports.validateParams = validateParams;
/**
 * Middleware для валидации query-параметров запроса
 * @param schema Joi схема для валидации
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details.map((detail) => detail.message).join(', ');
            logger.warn(`Ошибка валидации query-параметров запроса: ${errorMessage}`);
            res.status(400).json({
                message: 'Ошибка валидации',
                errors: error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                })),
            });
            return;
        }
        // Заменяем query-параметры запроса валидированными данными
        req.query = value;
        next();
    };
};
exports.validateQuery = validateQuery;
/**
 * Middleware для валидации запросов с помощью express-validator
 * @param validations Массив валидаторов
 * @returns Middleware функция
 */
const validateRequest = (validations) => {
    return async (req, res, next) => {
        // Выполняем все валидаторы
        for (const validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length)
                break;
        }
        // Собираем ошибки валидации
        const errors = (0, express_validator_1.validationResult)(req);
        // Если ошибок нет, продолжаем выполнение запроса
        if (errors.isEmpty()) {
            return next();
        }
        // Логируем ошибки валидации
        logger.debug(`Validation errors: ${JSON.stringify(errors.array())}`);
        // Возвращаем ошибки клиенту
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: errors.array(),
        });
    };
};
exports.validateRequest = validateRequest;
exports.default = exports.validateRequest;
