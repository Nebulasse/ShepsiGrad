import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateZod } from '../middleware/validation.middleware';
import * as authSchema from '../schemas/auth.schema';

const router = Router();

// Регистрация
router.post('/register', validateZod(authSchema.register), authController.register);

// Вход
router.post('/login', validateZod(authSchema.login), authController.login);

// Обновление токенов
router.post('/refresh-token', authController.refreshTokens);

// Выход
router.post('/logout', authenticate, authController.logout);

// Получение информации о текущем пользователе
router.get('/me', authenticate, authController.getCurrentUser);

// Подтверждение email
router.get('/verify-email/:token', authController.verifyEmail);

// Запрос на сброс пароля
router.post('/forgot-password', validateZod(authSchema.forgotPassword), authController.requestPasswordReset);

// Сброс пароля
router.post('/reset-password', validateZod(authSchema.resetPassword), authController.resetPassword);

export default router; 