"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const User_1 = require("../models/User");
const logger = (0, logger_1.getModuleLogger)('AuthMiddleware');
/**
 * Middleware для проверки аутентификации
 */
const authenticate = async (req, res, next) => {
    try {
        // Получаем токен из заголовка
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: 'error',
                message: 'Отсутствует токен авторизации',
            });
        }
        const token = authHeader.split(' ')[1];
        // Проверяем токен
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt.secret);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Недействительный токен',
            });
        }
        // Находим пользователя в базе данных
        const user = await User_1.User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Пользователь не найден',
            });
        }
        // Добавляем пользователя к запросу
        req.user = user;
        next();
    }
    catch (error) {
        logger.error(`Ошибка аутентификации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        return res.status(401).json({
            status: 'error',
            message: 'Ошибка аутентификации',
        });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware для проверки авторизации по ролям
 * @param roles Массив разрешенных ролей
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        const authReq = req;
        if (!authReq.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Требуется аутентификация',
            });
        }
        if (!roles.includes(authReq.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Доступ запрещен. Требуемые роли: ${roles.join(', ')}`,
            });
        }
        next();
    };
};
exports.authorize = authorize;
exports.default = { authenticate: exports.authenticate, authorize: exports.authorize };
