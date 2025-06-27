"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const User_1 = require("../models/User");
const Property_1 = require("../models/Property");
const Booking_1 = require("../models/Booking");
const loggerService_1 = require("../services/loggerService");
exports.adminController = {
    // Получение статистики по пользователям
    async getUserStats(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { start_date, end_date } = req.query;
            const stats = await User_1.UserModel.getStats({
                startDate: start_date,
                endDate: end_date
            });
            res.json(stats);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting user stats', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение статистики по объектам недвижимости
    async getPropertyStats(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { start_date, end_date } = req.query;
            const stats = await Property_1.PropertyModel.getStats({
                startDate: start_date,
                endDate: end_date
            });
            res.json(stats);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting property stats', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение статистики по бронированиям
    async getBookingStats(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { start_date, end_date } = req.query;
            const stats = await Booking_1.BookingModel.getStats({
                startDate: start_date,
                endDate: end_date
            });
            res.json(stats);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting booking stats', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение активности пользователя
    async getUserActivity(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { userId } = req.params;
            const { start_date, end_date } = req.query;
            const activity = await User_1.UserModel.getActivity(userId, {
                startDate: start_date,
                endDate: end_date
            });
            res.json(activity);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting user activity', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                targetUserId: req.params.userId,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Блокировка пользователя
    async blockUser(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { userId } = req.params;
            const { reason, duration } = req.body;
            const user = await User_1.UserModel.update(userId, {
                is_blocked: true,
                block_reason: reason,
                block_until: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
            });
            loggerService_1.LoggerService.info('User blocked by admin', {
                adminId: req.user.id,
                targetUserId: userId,
                reason,
                duration
            });
            res.json(user);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error blocking user', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                targetUserId: req.params.userId,
                blockData: req.body
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Разблокировка пользователя
    async unblockUser(req, res) {
        var _a;
        try {
            if (!req.user || req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { userId } = req.params;
            const user = await User_1.UserModel.update(userId, {
                is_blocked: false,
                block_reason: null,
                block_until: null
            });
            loggerService_1.LoggerService.info('User unblocked by admin', {
                adminId: req.user.id,
                targetUserId: userId
            });
            res.json(user);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error unblocking user', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                targetUserId: req.params.userId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение списка заблокированных пользователей
    async getBlockedUsers(req, res) {
        var _a;
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
                filters: {
                    is_blocked: true
                }
            });
            if (error)
                throw error;
            res.json({
                users: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting blocked users', {
                error,
                adminId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
