"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(auth_1.authenticate);
// Получение списка уведомлений
router.get('/', (0, validation_1.validateQuery)(validationSchemas_1.querySchema), notificationController_1.notificationController.getNotifications);
// Получение количества непрочитанных уведомлений
router.get('/unread/count', notificationController_1.notificationController.getUnreadCount);
// Получение уведомления по ID
router.get('/:id', notificationController_1.notificationController.getNotificationById);
// Отметить уведомление как прочитанное
router.put('/:id/read', notificationController_1.notificationController.markAsRead);
// Отметить все уведомления как прочитанные
router.put('/read-all', notificationController_1.notificationController.markAllAsRead);
// Удаление уведомления
router.delete('/:id', notificationController_1.notificationController.deleteNotification);
exports.default = router;
