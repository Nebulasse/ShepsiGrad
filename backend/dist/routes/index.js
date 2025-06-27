"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const propertyRoutes_1 = __importDefault(require("./propertyRoutes"));
const bookingRoutes_1 = __importDefault(require("./bookingRoutes"));
const favoriteRoutes_1 = __importDefault(require("./favoriteRoutes"));
const chatRoutes_1 = __importDefault(require("./chatRoutes"));
const notificationRoutes_1 = __importDefault(require("./notificationRoutes"));
const imageRoutes_1 = __importDefault(require("./imageRoutes"));
const mapRoutes_1 = __importDefault(require("./mapRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const reviewRoutes_1 = __importDefault(require("./reviewRoutes"));
// Импорты других маршрутов будут добавлены по мере разработки
const router = (0, express_1.Router)();
// Маршруты аутентификации
router.use('/auth', auth_routes_1.default);
// Маршруты пользователей
router.use('/users', userRoutes_1.default);
// Маршруты объектов недвижимости
router.use('/properties', propertyRoutes_1.default);
// Маршруты бронирований
router.use('/bookings', bookingRoutes_1.default);
// Маршруты избранного
router.use('/favorites', favoriteRoutes_1.default);
// Маршруты чатов
router.use('/chats', chatRoutes_1.default);
// Маршруты уведомлений
router.use('/notifications', notificationRoutes_1.default);
// Маршруты для работы с изображениями
router.use('/images', imageRoutes_1.default);
// Маршруты для работы с картами
router.use('/maps', mapRoutes_1.default);
// Маршруты администратора
router.use('/admin', adminRoutes_1.default);
// Маршруты отзывов
router.use('/reviews', reviewRoutes_1.default);
// Маршрут для проверки работоспособности
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'API работает нормально'
    });
});
// Другие маршруты будут добавлены по мере разработки
// router.use('/properties', propertyRoutes);
// router.use('/bookings', bookingRoutes);
// и т.д.
exports.default = router;
