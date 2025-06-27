"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_schema_1 = require("../schemas/auth.schema");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @route POST /api/auth/register
 * @desc Регистрация нового пользователя
 * @access Public
 */
router.post('/register', (0, validation_middleware_1.validateBody)(auth_schema_1.registerSchema), auth_controller_1.authController.register);
/**
 * @route POST /api/auth/login
 * @desc Вход пользователя
 * @access Public
 */
router.post('/login', (0, validation_middleware_1.validateBody)(auth_schema_1.loginSchema), auth_controller_1.authController.login);
/**
 * @route POST /api/auth/refresh-token
 * @desc Обновление токена доступа
 * @access Public
 */
router.post('/refresh-token', (0, validation_middleware_1.validateBody)(auth_schema_1.refreshTokenSchema), auth_controller_1.authController.refreshToken);
/**
 * @route GET /api/auth/verify-email/:token
 * @desc Подтверждение email пользователя
 * @access Public
 */
router.get('/verify-email/:token', (0, validation_middleware_1.validateParams)(auth_schema_1.verifyEmailSchema), auth_controller_1.authController.verifyEmail);
/**
 * @route POST /api/auth/forgot-password
 * @desc Запрос на сброс пароля
 * @access Public
 */
router.post('/forgot-password', (0, validation_middleware_1.validateBody)(auth_schema_1.requestPasswordResetSchema), auth_controller_1.authController.forgotPassword);
/**
 * @route POST /api/auth/reset-password
 * @desc Сброс пароля
 * @access Public
 */
router.post('/reset-password', (0, validation_middleware_1.validateBody)(auth_schema_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
/**
 * @route GET /api/auth/me
 * @desc Получение текущего пользователя
 * @access Private
 */
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
exports.default = router;
