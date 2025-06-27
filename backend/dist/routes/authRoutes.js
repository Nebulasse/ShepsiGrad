"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const authValidation_1 = require("../schemas/authValidation");
const router = express_1.default.Router();
// Регистрация и авторизация через email/пароль
router.post('/register', (0, validation_1.validateRequest)(authValidation_1.validateAuth.register), authController_1.authController.register);
router.post('/login', (0, validation_1.validateRequest)(authValidation_1.validateAuth.login), authController_1.authController.login);
router.post('/logout', authController_1.authController.logout);
// Авторизация через социальные сети
router.post('/social-login', (0, validation_1.validateRequest)(authValidation_1.validateAuth.socialLogin), authController_1.authController.socialLogin);
// Обновление токена
router.post('/refresh-token', (0, validation_1.validateRequest)(authValidation_1.validateAuth.refreshToken), authController_1.authController.refreshToken);
// Аутентификация через телефон
router.post('/send-otp', (0, validation_1.validateRequest)(authValidation_1.validateAuth.sendOtp), authController_1.authController.sendPhoneOtp);
router.post('/verify-otp', (0, validation_1.validateRequest)(authValidation_1.validateAuth.verifyOtp), authController_1.authController.verifyPhoneOtp);
// Текущий пользователь
router.get('/me', authController_1.authController.getCurrentUser);
// Сброс пароля
router.post('/reset-password', (0, validation_1.validateRequest)(authValidation_1.validateAuth.resetPassword), authController_1.authController.resetPassword);
router.post('/update-password', (0, validation_1.validateRequest)(authValidation_1.validateAuth.updatePassword), authController_1.authController.updatePassword);
exports.default = router;
