"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const loggerService_1 = require("../services/loggerService");
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getModuleLogger)('UserController');
/**
 * Контроллер для работы с пользователями
 */
const userController = {
    /**
     * Получение профиля текущего пользователя
     */
    getProfile: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await User_1.UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            logger.error(`Ошибка при получении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            res.status(500).json({
                status: 'error',
                message: 'Ошибка при получении профиля пользователя'
            });
        }
    },
    /**
     * Обновление профиля текущего пользователя
     */
    updateProfile: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { user_id } = req.user;
            const { full_name, phone_number, bio, notifications_enabled, email_notifications_enabled } = req.body;
            // Обновляем профиль пользователя
            const updatedUser = await User_1.UserModel.update(user_id, {
                full_name,
                phone_number,
                bio,
                notifications_enabled,
                email_notifications_enabled,
                updated_at: new Date()
            });
            res.status(200).json({
                status: 'success',
                message: 'Профиль успешно обновлен',
                data: {
                    user: updatedUser
                }
            });
        }
        catch (error) {
            logger.error(`Ошибка при обновлении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            res.status(500).json({
                status: 'error',
                message: 'Ошибка при обновлении профиля пользователя'
            });
        }
    },
    /**
     * Удаление профиля текущего пользователя
     */
    deleteProfile: async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            await User_1.UserModel.delete(req.user.id);
            res.json({ status: 'success', message: 'Профиль успешно удален' });
        }
        catch (error) {
            logger.error(`Ошибка при удалении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            res.status(500).json({
                status: 'error',
                message: 'Ошибка при удалении профиля пользователя'
            });
        }
    },
    /**
     * Получение списка всех пользователей (только для админа)
     */
    getAllUsers: async (req, res) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { page = 1, limit = 10 } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;
            const { data, error, count } = await User_1.UserModel.findAll({
                start,
                end,
                orderBy: 'created_at',
                orderDirection: 'desc'
            });
            if (error)
                throw error;
            res.json({
                status: 'success',
                data: {
                    users: data,
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        }
        catch (error) {
            logger.error(`Ошибка при получении списка пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            res.status(500).json({
                status: 'error',
                message: 'Ошибка при получении списка пользователей'
            });
        }
    },
    async updateUserRole(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { userId } = req.params;
            const { role } = req.body;
            if (!['user', 'admin', 'landlord'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }
            const user = await User_1.UserModel.update(userId, { role });
            res.json(user);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error updating user role', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                targetUserId: req.params.userId,
                newRole: req.body.role
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
exports.default = userController;
