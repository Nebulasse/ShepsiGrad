import { Response } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import { LoggerService } from '../services/loggerService';

export const notificationController = {
    async getNotifications(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { page = 1, limit = 10, read, type } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;

            const { data, error, count } = await NotificationModel.findAll({
                start,
                end,
                filters: {
                    user_id: req.user.id,
                    read: read === 'true' ? true : read === 'false' ? false : undefined,
                    type: type as string
                }
            });

            if (error) throw error;

            res.json({
                notifications: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        } catch (error) {
            LoggerService.error('Error getting notifications', { 
                error,
                userId: req.user?.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getNotificationById(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const notification = await NotificationModel.findById(id);

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            res.json(notification);
        } catch (error) {
            LoggerService.error('Error getting notification by id', { 
                error,
                userId: req.user?.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async markAsRead(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const notification = await NotificationModel.findById(id);

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const updatedNotification = await NotificationModel.markAsRead(id);
            res.json(updatedNotification);
        } catch (error) {
            LoggerService.error('Error marking notification as read', { 
                error,
                userId: req.user?.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async markAllAsRead(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await NotificationModel.markAllAsRead(req.user.id);
            res.json({ message: 'All notifications marked as read' });
        } catch (error) {
            LoggerService.error('Error marking all notifications as read', { 
                error,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async deleteNotification(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const notification = await NotificationModel.findById(id);

            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }

            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await NotificationModel.delete(id);
            res.json({ message: 'Notification deleted successfully' });
        } catch (error) {
            LoggerService.error('Error deleting notification', { 
                error,
                userId: req.user?.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getUnreadCount(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const count = await NotificationModel.getUnreadCount(req.user.id);
            res.json({ count });
        } catch (error) {
            LoggerService.error('Error getting unread notifications count', { 
                error,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}; 