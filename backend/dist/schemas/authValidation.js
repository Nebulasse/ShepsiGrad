"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuth = void 0;
const joi_1 = __importDefault(require("joi"));
exports.validateAuth = {
    // Валидация данных для регистрации
    register: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(8).required(),
        full_name: joi_1.default.string().min(2).max(100).required(),
        phone_number: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
        role: joi_1.default.string().valid('user', 'landlord').default('user')
    }),
    // Валидация данных для входа
    login: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required()
    }),
    // Валидация данных для авторизации через соцсети
    socialLogin: joi_1.default.object({
        id: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        provider: joi_1.default.string().valid('google', 'facebook', 'vk').required(),
        full_name: joi_1.default.string().optional(),
        phone_number: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    }),
    // Валидация данных для отправки OTP на телефон
    sendOtp: joi_1.default.object({
        phone: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
    }),
    // Валидация данных для входа через OTP
    verifyOtp: joi_1.default.object({
        phone: joi_1.default.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
        otp: joi_1.default.string().length(6).pattern(/^\d+$/).required()
    }),
    // Валидация данных для обновления токена
    refreshToken: joi_1.default.object({
        refresh_token: joi_1.default.string().required()
    }),
    // Валидация данных для сброса пароля
    resetPassword: joi_1.default.object({
        email: joi_1.default.string().email().required()
    }),
    // Валидация данных для обновления пароля
    updatePassword: joi_1.default.object({
        newPassword: joi_1.default.string().min(8).required()
    })
};
