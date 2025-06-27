"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const Notification_1 = require("../models/Notification");
const loggerService_1 = require("../services/loggerService");
exports.notificationController = {
    async getNotifications(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { page = 1, limit = 10, read, type } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;
            const { data, error, count } = await Notification_1.NotificationModel.findAll({
                start,
                end,
                filters: {
                    user_id: req.user.id,
                    read: read === 'true' ? true : read === 'false' ? false : undefined,
                    type: type
                }
            });
            if (error)
                throw error;
            res.json({
                notifications: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting notifications', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getNotificationById(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const notification = await Notification_1.NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            res.json(notification);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting notification by id', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async markAsRead(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const notification = await Notification_1.NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const updatedNotification = await Notification_1.NotificationModel.markAsRead(id);
            res.json(updatedNotification);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error marking notification as read', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async markAllAsRead(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            await Notification_1.NotificationModel.markAllAsRead(req.user.id);
            res.json({ message: 'All notifications marked as read' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error marking all notifications as read', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async deleteNotification(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const notification = await Notification_1.NotificationModel.findById(id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            if (notification.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            await Notification_1.NotificationModel.delete(id);
            res.json({ message: 'Notification deleted successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error deleting notification', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                notificationId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getUnreadCount(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const count = await Notification_1.NotificationModel.getUnreadCount(req.user.id);
            res.json({ count });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting unread notifications count', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
