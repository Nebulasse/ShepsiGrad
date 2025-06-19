import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { PropertyModel } from '../models/Property';
import { BookingModel } from '../models/Booking';
import { LoggerService } from '../services/loggerService';

export const adminController = {
    // Получение статистики по пользователям
    async getUserStats(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { start_date, end_date } = req.query;
            const stats = await UserModel.getStats({
                startDate: start_date as string,
                endDate: end_date as string
            });

            res.json(stats);
        } catch (error) {
            LoggerService.error('Error getting user stats', { 
                error,
                adminId: req.user?.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение статистики по объектам недвижимости
    async getPropertyStats(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { start_date, end_date } = req.query;
            const stats = await PropertyModel.getStats({
                startDate: start_date as string,
                endDate: end_date as string
            });

            res.json(stats);
        } catch (error) {
            LoggerService.error('Error getting property stats', { 
                error,
                adminId: req.user?.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение статистики по бронированиям
    async getBookingStats(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { start_date, end_date } = req.query;
            const stats = await BookingModel.getStats({
                startDate: start_date as string,
                endDate: end_date as string
            });

            res.json(stats);
        } catch (error) {
            LoggerService.error('Error getting booking stats', { 
                error,
                adminId: req.user?.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение активности пользователя
    async getUserActivity(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { userId } = req.params;
            const { start_date, end_date } = req.query;

            const activity = await UserModel.getActivity(userId, {
                startDate: start_date as string,
                endDate: end_date as string
            });

            res.json(activity);
        } catch (error) {
            LoggerService.error('Error getting user activity', { 
                error,
                adminId: req.user?.id,
                targetUserId: req.params.userId,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Блокировка пользователя
    async blockUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { userId } = req.params;
            const { reason, duration } = req.body;

            const user = await UserModel.update(userId, {
                is_blocked: true,
                block_reason: reason,
                block_until: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
            });

            LoggerService.info('User blocked by admin', {
                adminId: req.user.id,
                targetUserId: userId,
                reason,
                duration
            });

            res.json(user);
        } catch (error) {
            LoggerService.error('Error blocking user', { 
                error,
                adminId: req.user?.id,
                targetUserId: req.params.userId,
                blockData: req.body
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Разблокировка пользователя
    async unblockUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { userId } = req.params;
            const user = await UserModel.update(userId, {
                is_blocked: false,
                block_reason: null,
                block_until: null
            });

            LoggerService.info('User unblocked by admin', {
                adminId: req.user.id,
                targetUserId: userId
            });

            res.json(user);
        } catch (error) {
            LoggerService.error('Error unblocking user', { 
                error,
                adminId: req.user?.id,
                targetUserId: req.params.userId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение списка заблокированных пользователей
    async getBlockedUsers(req: AuthRequest, res: Response) {
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
                filters: {
                    is_blocked: true
                }
            });

            if (error) throw error;

            res.json({
                users: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        } catch (error) {
            LoggerService.error('Error getting blocked users', { 
                error,
                adminId: req.user?.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}; 