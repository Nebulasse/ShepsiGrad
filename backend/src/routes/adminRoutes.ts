import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { validateQuery } from '../utils/validation';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Статистика
router.get('/stats/users', validateRequest(validateQuery), adminController.getUserStats);
router.get('/stats/properties', validateRequest(validateQuery), adminController.getPropertyStats);
router.get('/stats/bookings', validateRequest(validateQuery), adminController.getBookingStats);

// Активность пользователей
router.get('/users/:userId/activity', validateRequest(validateQuery), adminController.getUserActivity);

// Управление пользователями
router.post('/users/:userId/block', adminController.blockUser);
router.post('/users/:userId/unblock', adminController.unblockUser);
router.get('/users/blocked', validateRequest(validateQuery), adminController.getBlockedUsers);

export default router; 