"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = __importDefault(require("../middleware/validation.middleware"));
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = express_1.default.Router();
// Заглушка для контроллера бронирования
const bookingController = {
    createBooking: (req, res) => {
        res.status(200).json({ message: 'Бронирование создано успешно' });
    },
    getBookingById: (req, res) => {
        res.status(200).json({ message: 'Информация о бронировании' });
    },
    getUserBookings: (req, res) => {
        res.status(200).json({ message: 'Список бронирований пользователя' });
    },
    getPropertyBookings: (req, res) => {
        res.status(200).json({ message: 'Список бронирований для объекта недвижимости' });
    },
    updateBookingStatus: (req, res) => {
        res.status(200).json({ message: 'Статус бронирования обновлен' });
    },
    cancelBooking: (req, res) => {
        res.status(200).json({ message: 'Бронирование отменено' });
    },
    checkPropertyAvailability: (req, res) => {
        res.status(200).json({ message: 'Проверка доступности объекта', available: true });
    },
    getAvailableDates: (req, res) => {
        res.status(200).json({
            message: 'Доступные даты для бронирования',
            dates: [
                { start: '2023-01-01', end: '2023-01-15' },
                { start: '2023-01-20', end: '2023-02-10' }
            ]
        });
    },
    createPayment: (req, res) => {
        res.status(200).json({ message: 'Платеж создан', paymentId: 'payment123' });
    },
    createStripePayment: (req, res) => {
        res.status(200).json({ message: 'Stripe платеж создан', paymentId: 'stripe_payment123' });
    },
    checkPaymentStatus: (req, res) => {
        res.status(200).json({ message: 'Статус платежа', status: 'paid' });
    },
    refundPayment: (req, res) => {
        res.status(200).json({ message: 'Платеж возвращен', refundId: 'refund123' });
    }
};
// Заглушка для валидации запросов
const validateQuery = (schema) => (req, res, next) => next();
// Защищенные маршруты
router.post('/', auth_middleware_1.authenticate, (0, validation_middleware_1.default)(validationSchemas_1.bookingSchema.create), bookingController.createBooking);
router.get('/:id', auth_middleware_1.authenticate, bookingController.getBookingById);
router.get('/user/bookings', auth_middleware_1.authenticate, validateQuery({}), bookingController.getUserBookings);
router.get('/property/:propertyId/bookings', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('admin', 'landlord'), validateQuery({}), bookingController.getPropertyBookings);
router.put('/:id/status', auth_middleware_1.authenticate, (0, validation_middleware_1.default)(validationSchemas_1.bookingSchema.update), bookingController.updateBookingStatus);
router.post('/:id/cancel', auth_middleware_1.authenticate, bookingController.cancelBooking);
// Маршрут для проверки доступности объекта
router.get('/property/:property_id/availability', bookingController.checkPropertyAvailability);
// Маршрут для получения доступных дат для бронирования
router.get('/property/:property_id/available-dates', bookingController.getAvailableDates);
// Маршруты для платежей
router.post('/payment/create', auth_middleware_1.authenticate, bookingController.createPayment);
router.post('/payment/stripe/create', auth_middleware_1.authenticate, bookingController.createStripePayment);
router.get('/payment/status/:id', auth_middleware_1.authenticate, bookingController.checkPaymentStatus);
router.post('/payment/refund', auth_middleware_1.authenticate, bookingController.refundPayment);
exports.default = router;
