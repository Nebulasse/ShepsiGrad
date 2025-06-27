"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = __importDefault(require("../middleware/validation.middleware"));
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = (0, express_1.Router)();
// Публичные маршруты
router.post('/register', (0, validation_middleware_1.default)(validationSchemas_1.authSchema.register), auth_controller_1.authController.register);
router.post('/login', (0, validation_middleware_1.default)(validationSchemas_1.authSchema.login), auth_controller_1.authController.login);
router.post('/refresh-token', (0, validation_middleware_1.default)(validationSchemas_1.authSchema.refreshToken), auth_controller_1.authController.refreshToken);
// Защищенные маршруты
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.authController.logout);
// Получение текущего пользователя
router.get('/me', auth_controller_1.authController.getCurrentUser);
exports.default = router;
