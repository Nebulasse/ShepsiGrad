import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import validateRequest from '../middleware/validation.middleware';
import { authSchema } from '../schemas/validationSchemas';

const router = Router();

// Публичные маршруты
router.post('/register', validateRequest(authSchema.register), authController.register);
router.post('/login', validateRequest(authSchema.login), authController.login);
router.post('/refresh-token', validateRequest(authSchema.refreshToken), authController.refreshToken);

// Защищенные маршруты
router.post('/logout', authenticate, authController.logout);

// Получение текущего пользователя
router.get('/me', authController.getCurrentUser);

export default router; 