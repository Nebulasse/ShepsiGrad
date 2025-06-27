"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.generateToken = exports.auth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const loggerService_1 = require("../services/loggerService");
const env_1 = require("../config/env");
// Аутентификация пользователя
const authenticate = async (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwt.secret);
        const user = await User_1.User.findOne({ _id: decoded._id });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    }
    catch (error) {
        loggerService_1.LoggerService.error('Authentication error', { error });
        res.status(401).json({ error: 'Пожалуйста, авторизуйтесь' });
    }
};
exports.authenticate = authenticate;
// Проверка роли пользователя
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied',
                message: `Required role: ${roles.join(' or ')}`
            });
        }
        next();
    };
};
exports.authorize = authorize;
exports.auth = exports.authenticate; // Для обратной совместимости
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ _id: userId }, env_1.env.jwt.secret, {
        expiresIn: '7d'
    });
};
exports.generateToken = generateToken;
// Middleware для проверки роли пользователя (для обратной совместимости)
const checkRole = (roles) => {
    return (0, exports.authorize)(...roles);
};
exports.checkRole = checkRole;
