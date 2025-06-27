"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.requestPasswordResetSchema = exports.verifyEmailSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const user_model_1 = require("../models/user.model");
// Схема для валидации данных при регистрации пользователя
exports.registerSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Некорректный формат email',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен',
    }),
    password: joi_1.default.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .messages({
        'string.min': 'Пароль должен содержать минимум 8 символов',
        'string.empty': 'Пароль не может быть пустым',
        'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
        'any.required': 'Пароль обязателен',
    }),
    firstName: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Имя не может быть пустым',
        'any.required': 'Имя обязательно',
    }),
    lastName: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Фамилия не может быть пустой',
        'any.required': 'Фамилия обязательна',
    }),
    phone: joi_1.default.string()
        .pattern(/^\+?[0-9]{10,15}$/)
        .allow(null, '')
        .messages({
        'string.pattern.base': 'Некорректный формат телефона',
    }),
    role: joi_1.default.string()
        .valid(...Object.values(user_model_1.UserRole))
        .default(user_model_1.UserRole.USER)
        .messages({
        'any.only': 'Недопустимая роль',
    }),
});
// Схема для валидации данных при входе
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Некорректный формат email',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен',
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Пароль не может быть пустым',
        'any.required': 'Пароль обязателен',
    }),
});
// Схема для валидации токена обновления
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Токен обновления не может быть пустым',
        'any.required': 'Токен обновления обязателен',
    }),
});
// Схема для валидации токена подтверждения email
exports.verifyEmailSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Токен не может быть пустым',
        'any.required': 'Токен обязателен',
    }),
});
// Схема для валидации запроса на сброс пароля
exports.requestPasswordResetSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Некорректный формат email',
        'string.empty': 'Email не может быть пустым',
        'any.required': 'Email обязателен',
    }),
});
// Схема для валидации сброса пароля
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string()
        .required()
        .messages({
        'string.empty': 'Токен не может быть пустым',
        'any.required': 'Токен обязателен',
    }),
    password: joi_1.default.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .messages({
        'string.min': 'Пароль должен содержать минимум 8 символов',
        'string.empty': 'Пароль не может быть пустым',
        'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
        'any.required': 'Пароль обязателен',
    }),
});
