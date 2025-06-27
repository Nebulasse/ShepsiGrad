"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const User_1 = require("../models/User");
const logger = (0, logger_1.getModuleLogger)('AuthService');
/**
 * Сервис для работы с аутентификацией и авторизацией
 */
class AuthService {
    /**
     * Регистрация нового пользователя
     * @param userData Данные пользователя
     * @returns Результат регистрации
     */
    static async register(userData) {
        try {
            // Проверяем, существует ли пользователь с таким email
            const existingUser = await User_1.User.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }
            // Создаем нового пользователя
            const user = await User_1.User.create({
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                role: userData.role || 'user',
                emailVerified: false,
                status: 'pending',
                emailVerificationToken: (0, uuid_1.v4)(),
            });
            return user;
        }
        catch (error) {
            logger.error(`Ошибка при регистрации пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Вход пользователя
     * @param email Email пользователя
     * @param password Пароль пользователя
     * @returns Результат входа
     */
    static async login(email, password) {
        try {
            // Находим пользователя по email
            const user = await User_1.User.findByEmail(email);
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            // Проверяем пароль
            const isPasswordValid = await User_1.User.comparePassword(password, user.password || '');
            if (!isPasswordValid) {
                throw new Error('Неверный пароль');
            }
            // Проверяем статус пользователя
            if (user.status === 'blocked') {
                throw new Error('Пользователь заблокирован');
            }
            // Генерируем токены
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Обновляем дату последнего входа
            await User_1.User.update(user.id, {
                lastLoginAt: new Date(),
            });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                tokens,
            };
        }
        catch (error) {
            logger.error(`Ошибка при входе пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Обновление токена доступа
     * @param refreshToken Токен обновления
     * @returns Новые токены
     */
    static async refreshToken(refreshToken) {
        try {
            // Проверяем токен обновления
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.jwt.secret);
            // Находим пользователя
            const user = await User_1.User.findById(decoded.userId);
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            // Генерируем новые токены
            const tokens = this.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            return tokens;
        }
        catch (error) {
            logger.error(`Ошибка при обновлении токена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Подтверждение email пользователя
     * @param token Токен подтверждения
     * @returns Пользователь после подтверждения
     */
    static async verifyEmail(token) {
        try {
            // Находим пользователя по токену подтверждения
            const user = await User_1.User.findOne({ emailVerificationToken: token });
            if (!user) {
                throw new Error('Недействительный токен подтверждения');
            }
            // Обновляем пользователя
            const updatedUser = {
                ...user,
                emailVerificationToken: undefined,
                emailVerified: true,
                status: 'active',
            };
            await User_1.User.update(user.id, updatedUser);
            return updatedUser;
        }
        catch (error) {
            logger.error(`Ошибка при подтверждении email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Запрос на сброс пароля
     * @param email Email пользователя
     * @returns true если запрос отправлен успешно
     */
    static async requestPasswordReset(email) {
        try {
            // Находим пользователя по email
            const user = await User_1.User.findByEmail(email);
            if (!user) {
                // Не сообщаем о несуществующем пользователе в целях безопасности
                return true;
            }
            // Генерируем токен сброса пароля
            const resetToken = (0, uuid_1.v4)();
            const resetExpires = new Date(Date.now() + 3600000); // 1 час
            // Обновляем пользователя
            await User_1.User.update(user.id, {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires,
            });
            // В реальном приложении здесь отправка email с токеном
            return true;
        }
        catch (error) {
            logger.error(`Ошибка при запросе сброса пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Сброс пароля
     * @param token Токен сброса
     * @param newPassword Новый пароль
     * @returns Пользователь после сброса пароля
     */
    static async resetPassword(token, newPassword) {
        try {
            // Находим пользователя по токену сброса
            const user = await User_1.User.findOne({ passwordResetToken: token });
            if (!user) {
                throw new Error('Недействительный токен сброса');
            }
            // Проверяем срок действия токена
            if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
                throw new Error('Истек срок действия токена сброса');
            }
            // Обновляем пароль пользователя
            const updatedUser = {
                ...user,
                password: newPassword,
                passwordResetToken: undefined,
                passwordResetExpires: undefined,
            };
            await User_1.User.update(user.id, updatedUser);
            return updatedUser;
        }
        catch (error) {
            logger.error(`Ошибка при сбросе пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            throw error;
        }
    }
    /**
     * Генерация токенов доступа и обновления
     * @param payload Полезная нагрузка для токенов
     * @returns Токены доступа и обновления
     */
    static generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.accessExpiresIn });
        const refreshToken = jsonwebtoken_1.default.sign(payload, env_1.env.jwt.secret, { expiresIn: env_1.env.jwt.refreshExpiresIn });
        return { accessToken, refreshToken };
    }
}
exports.AuthService = AuthService;
exports.authService = AuthService;
