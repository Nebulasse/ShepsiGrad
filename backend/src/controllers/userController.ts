import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';
import { LoggerService } from '../services/loggerService';

export const userController = {
    // Получение профиля текущего пользователя
    async getProfile(req: AuthRequest, res: Response) {
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
            LoggerService.error('Error getting user profile', { error, userId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновление профиля пользователя
    async updateProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { full_name, phone_number } = req.body;

            const user = await UserModel.update(req.user.id, {
                full_name,
                phone_number
            });

            res.json(user);
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                LoggerService.error('Error updating user profile', { error, userId: req.user?.id });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    async deleteProfile(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await UserModel.delete(req.user.id);
            res.json({ message: 'Profile deleted successfully' });
        } catch (error) {
            LoggerService.error('Error deleting user profile', { error, userId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение списка всех пользователей (только для админов)
    async getAllUsers(req: AuthRequest, res: Response) {
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
                users: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        } catch (error) {
            LoggerService.error('Error getting all users', { error, adminId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
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