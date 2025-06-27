"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../utils/validation");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(auth_1.authenticate);
// Статистика
router.get('/stats/users', (0, validation_1.validateRequest)(validation_2.validateQuery), adminController_1.adminController.getUserStats);
router.get('/stats/properties', (0, validation_1.validateRequest)(validation_2.validateQuery), adminController_1.adminController.getPropertyStats);
router.get('/stats/bookings', (0, validation_1.validateRequest)(validation_2.validateQuery), adminController_1.adminController.getBookingStats);
// Активность пользователей
router.get('/users/:userId/activity', (0, validation_1.validateRequest)(validation_2.validateQuery), adminController_1.adminController.getUserActivity);
// Управление пользователями
router.post('/users/:userId/block', adminController_1.adminController.blockUser);
router.post('/users/:userId/unblock', adminController_1.adminController.unblockUser);
router.get('/users/blocked', (0, validation_1.validateRequest)(validation_2.validateQuery), adminController_1.adminController.getBlockedUsers);
exports.default = router;
