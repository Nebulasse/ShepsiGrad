import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validateBody, validateParams } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  requestPasswordResetSchema,
  resetPasswordSchema
} from '../schemas/auth.schema';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Регистрация нового пользователя
 * @access Public
 */
router.post(
  '/register',
  validateBody(registerSchema),
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Вход пользователя
 * @access Public
 */
router.post(
  '/login',
  validateBody(loginSchema),
  authController.login
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Обновление токена доступа
 * @access Public
 */
router.post(
  '/refresh-token',
  validateBody(refreshTokenSchema),
  authController.refreshToken
);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Подтверждение email пользователя
 * @access Public
 */
router.get(
  '/verify-email/:token',
  validateParams(verifyEmailSchema),
  authController.verifyEmail
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Запрос на сброс пароля
 * @access Public
 */
router.post(
  '/forgot-password',
  validateBody(requestPasswordResetSchema),
  authController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Сброс пароля
 * @access Public
 */
router.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

/**
 * @route GET /api/auth/me
 * @desc Получение текущего пользователя
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

export default router; 