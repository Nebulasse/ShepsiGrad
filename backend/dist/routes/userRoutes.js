"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const userController_1 = __importDefault(require("../controllers/userController"));
const validation_middleware_1 = __importDefault(require("../middleware/validation.middleware"));
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = express_1.default.Router();
// Публичные маршруты
router.get('/public/:id', (req, res) => {
    res.status(200).json({ message: 'Публичный профиль пользователя' });
});
// Защищенные маршруты
router.get('/profile', auth_middleware_1.authenticate, userController_1.default.getProfile);
router.put('/profile', auth_middleware_1.authenticate, (0, validation_middleware_1.default)(validationSchemas_1.userSchema.updateProfile), userController_1.default.updateProfile);
router.delete('/profile', auth_middleware_1.authenticate, userController_1.default.deleteProfile);
// Маршруты для администраторов
router.get('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), userController_1.default.getAllUsers);
router.get('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), (req, res) => {
    res.status(200).json({ message: 'Информация о пользователе' });
});
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), (req, res) => {
    res.status(200).json({ message: 'Пользователь обновлен' });
});
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin'), (req, res) => {
    res.status(200).json({ message: 'Пользователь удален' });
});
exports.default = router;
