import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';
import { LoggerService } from '../services/loggerService';
import { getModuleLogger } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const logger = getModuleLogger('UserController');

/**
 * Контроллер для работы с пользователями
 */
const userController = {
    /**
     * Получение профиля текущего пользователя
     */
    getProfile: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const user = await UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        } catch (error) {
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
    updateProfile: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { user_id } = req.user;
            const {
                full_name,
                phone_number,
                bio,
                notifications_enabled,
                email_notifications_enabled
            } = req.body;

            // Обновляем профиль пользователя
            const updatedUser = await UserModel.update(user_id, {
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
        } catch (error) {
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
    deleteProfile: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await UserModel.delete(req.user.id);
            res.json({ status: 'success', message: 'Профиль успешно удален' });
        } catch (error) {
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
    getAllUsers: async (req: AuthenticatedRequest, res: Response) => {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { page = 1, limit = 10 } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;

            const { data, error, count } = await UserModel.findAll({
                start,
                end,
                orderBy: 'created_at',
                orderDirection: 'desc'
            });

            if (error) throw error;

            res.json({
                status: 'success',
                data: {
                    users: data,
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });
        } catch (error) {
            logger.error(`Ошибка при получении списка пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            res.status(500).json({
                status: 'error',
                message: 'Ошибка при получении списка пользователей'
            });
        }
    },

    async updateUserRole(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { userId } = req.params;
            const { role } = req.body;

            if (!['user', 'admin', 'landlord'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            const user = await UserModel.update(userId, { role });
            res.json(user);
        } catch (error) {
            LoggerService.error('Error updating user role', { 
                error, 
                adminId: req.user?.id,
                targetUserId: req.params.userId,
                newRole: req.body.role
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

export default userController; 