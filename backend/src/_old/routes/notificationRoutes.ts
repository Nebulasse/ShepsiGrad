import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';
import { validateQuery } from '../middleware/validation';
import { querySchema } from '../schemas/validationSchemas';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получение списка уведомлений
router.get('/', validateQuery(querySchema), notificationController.getNotifications);

// Получение количества непрочитанных уведомлений
router.get('/unread/count', notificationController.getUnreadCount);

// Получение уведомления по ID
router.get('/:id', notificationController.getNotificationById);

// Отметить уведомление как прочитанное
router.put('/:id/read', notificationController.markAsRead);

// Отметить все уведомления как прочитанные
router.put('/read-all', notificationController.markAllAsRead);

// Удаление уведомления
router.delete('/:id', notificationController.deleteNotification);

export default router; 