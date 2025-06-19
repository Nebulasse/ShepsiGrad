import express from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { validateAuth } from '../schemas/authValidation';

const router = express.Router();

// Регистрация и авторизация через email/пароль
router.post('/register', validateRequest(validateAuth.register), authController.register);
router.post('/login', validateRequest(validateAuth.login), authController.login);
router.post('/logout', authController.logout);

// Авторизация через социальные сети
router.post('/social-login', validateRequest(validateAuth.socialLogin), authController.socialLogin);

// Обновление токена
router.post('/refresh-token', validateRequest(validateAuth.refreshToken), authController.refreshToken);

// Аутентификация через телефон
router.post('/send-otp', validateRequest(validateAuth.sendOtp), authController.sendPhoneOtp);
router.post('/verify-otp', validateRequest(validateAuth.verifyOtp), authController.verifyPhoneOtp);

// Текущий пользователь
router.get('/me', authController.getCurrentUser);

// Сброс пароля
router.post('/reset-password', validateRequest(validateAuth.resetPassword), authController.resetPassword);
router.post('/update-password', validateRequest(validateAuth.updatePassword), authController.updatePassword);

export default router; 