"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyQuerySchema = exports.querySchema = exports.updateProfileSchema = exports.notificationSchema = exports.favoriteSchema = exports.chatSchema = exports.reviewSchema = exports.bookingSchema = exports.propertySchema = exports.userSchema = exports.authSchema = void 0;
const zod_1 = require("zod");
const express_validator_1 = require("express-validator");
// Схемы для аутентификации
exports.authSchema = {
    register: [
        (0, express_validator_1.body)('email').isEmail().withMessage('Введите корректный email'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 6 })
            .withMessage('Пароль должен содержать минимум 6 символов'),
        (0, express_validator_1.body)('firstName').notEmpty().withMessage('Имя обязательно'),
        (0, express_validator_1.body)('lastName').notEmpty().withMessage('Фамилия обязательна'),
        (0, express_validator_1.body)('role')
            .optional()
            .isIn(['user', 'landlord'])
            .withMessage('Роль должна быть user или landlord'),
    ],
    login: [
        (0, express_validator_1.body)('email').isEmail().withMessage('Введите корректный email'),
        (0, express_validator_1.body)('password').notEmpty().withMessage('Пароль обязателен'),
    ],
    refreshToken: [
        (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token обязателен'),
    ],
    resetPassword: zod_1.z.object({
        email: zod_1.z.string().email('Некорректный email'),
    }),
    changePassword: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Токен не может быть пустым'),
        password: zod_1.z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
    }),
};
// Схемы для пользователей
exports.userSchema = {
    updateProfile: [
        (0, express_validator_1.body)('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
        (0, express_validator_1.body)('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
        (0, express_validator_1.body)('phone').optional().isMobilePhone('any').withMessage('Введите корректный номер телефона'),
        (0, express_validator_1.body)('email').optional().isEmail().withMessage('Введите корректный email'),
    ],
    updatePassword: zod_1.z.object({
        current_password: zod_1.z.string().min(1, 'Текущий пароль не может быть пустым'),
        new_password: zod_1.z.string().min(6, 'Новый пароль должен содержать не менее 6 символов'),
    }),
};
// Схемы для объектов недвижимости
exports.propertySchema = {
    create: [
        (0, express_validator_1.body)('title').notEmpty().withMessage('Название обязательно'),
        (0, express_validator_1.body)('description').notEmpty().withMessage('Описание обязательно'),
        (0, express_validator_1.body)('price').isNumeric().withMessage('Цена должна быть числом'),
        (0, express_validator_1.body)('address').notEmpty().withMessage('Адрес обязателен'),
        (0, express_validator_1.body)('city').notEmpty().withMessage('Город обязателен'),
        (0, express_validator_1.body)('country').notEmpty().withMessage('Страна обязательна'),
        (0, express_validator_1.body)('propertyType')
            .notEmpty()
            .isIn(['apartment', 'house', 'room', 'hostel'])
            .withMessage('Недопустимый тип недвижимости'),
        (0, express_validator_1.body)('bedrooms').isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
        (0, express_validator_1.body)('bathrooms').isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
        (0, express_validator_1.body)('maxGuests').isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
    ],
    update: [
        (0, express_validator_1.body)('title').optional().notEmpty().withMessage('Название не может быть пустым'),
        (0, express_validator_1.body)('description').optional().notEmpty().withMessage('Описание не может быть пустым'),
        (0, express_validator_1.body)('price').optional().isNumeric().withMessage('Цена должна быть числом'),
        (0, express_validator_1.body)('address').optional().notEmpty().withMessage('Адрес не может быть пустым'),
        (0, express_validator_1.body)('city').optional().notEmpty().withMessage('Город не может быть пустым'),
        (0, express_validator_1.body)('country').optional().notEmpty().withMessage('Страна не может быть пустой'),
        (0, express_validator_1.body)('propertyType')
            .optional()
            .isIn(['apartment', 'house', 'room', 'hostel'])
            .withMessage('Недопустимый тип недвижимости'),
        (0, express_validator_1.body)('bedrooms').optional().isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
        (0, express_validator_1.body)('bathrooms').optional().isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
        (0, express_validator_1.body)('maxGuests').optional().isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
    ],
    searchProperty: zod_1.z.object({
        city: zod_1.z.string().optional(),
        price_min: zod_1.z.number().optional(),
        price_max: zod_1.z.number().optional(),
        guests: zod_1.z.number().int().optional(),
        bedrooms: zod_1.z.number().int().optional(),
        amenities: zod_1.z.array(zod_1.z.string()).optional(),
        page: zod_1.z.number().int().positive().optional(),
        limit: zod_1.z.number().int().positive().optional(),
    }),
};
// Схемы для бронирований
exports.bookingSchema = {
    create: [
        (0, express_validator_1.body)('propertyId').notEmpty().withMessage('ID недвижимости обязателен'),
        (0, express_validator_1.body)('checkIn').isISO8601().withMessage('Дата заезда должна быть в формате ISO8601'),
        (0, express_validator_1.body)('checkOut').isISO8601().withMessage('Дата выезда должна быть в формате ISO8601'),
        (0, express_validator_1.body)('guests').isInt({ min: 1 }).withMessage('Количество гостей должно быть положительным числом'),
    ],
    update: [
        (0, express_validator_1.body)('status')
            .optional()
            .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
            .withMessage('Недопустимый статус бронирования'),
    ],
    createPayment: zod_1.z.object({
        booking_id: zod_1.z.string().min(1, 'ID бронирования не может быть пустым'),
    }),
    refundPayment: zod_1.z.object({
        booking_id: zod_1.z.string().min(1, 'ID бронирования не может быть пустым'),
    }),
};
// Схемы для отзывов
exports.reviewSchema = {
    createReview: [
        (0, express_validator_1.body)('propertyId').notEmpty().withMessage('ID недвижимости обязателен'),
        (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
        (0, express_validator_1.body)('comment').notEmpty().withMessage('Комментарий обязателен'),
    ],
    updateReview: [
        (0, express_validator_1.body)('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
        (0, express_validator_1.body)('comment').optional().notEmpty().withMessage('Комментарий не может быть пустым'),
    ],
    replyReview: [
        (0, express_validator_1.body)('reply').notEmpty().withMessage('Ответ обязателен'),
    ],
    moderateReview: [
        (0, express_validator_1.body)('isApproved').isBoolean().withMessage('Поле isApproved должно быть булевым'),
        (0, express_validator_1.body)('moderationComment').optional().isString().withMessage('Комментарий модерации должен быть строкой'),
    ],
};
// Схемы для чата
exports.chatSchema = {
    createConversation: zod_1.z.object({
        property_id: zod_1.z.string().min(1, 'ID объекта не может быть пустым'),
        recipient_id: zod_1.z.string().min(1, 'ID получателя не может быть пустым'),
        message: zod_1.z.string().min(1, 'Сообщение не может быть пустым'),
    }),
    sendMessage: zod_1.z.object({
        conversation_id: zod_1.z.string().min(1, 'ID беседы не может быть пустым'),
        message: zod_1.z.string().min(1, 'Сообщение не может быть пустым'),
    }),
};
// Схемы для избранного
exports.favoriteSchema = {
    addFavorite: zod_1.z.object({
        property_id: zod_1.z.string().min(1, 'ID объекта не может быть пустым'),
    }),
};
// Схемы для уведомлений
exports.notificationSchema = {
    markAsRead: zod_1.z.object({
        notification_id: zod_1.z.string().min(1, 'ID уведомления не может быть пустым'),
    }),
    markAllAsRead: zod_1.z.object({}),
};
/**
 * Схема для валидации данных при обновлении профиля
 */
exports.updateProfileSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(2).max(100).optional(),
    phone_number: zod_1.z.string().min(5).max(20).optional(),
    bio: zod_1.z.string().max(500).optional(),
    notifications_enabled: zod_1.z.boolean().optional(),
    email_notifications_enabled: zod_1.z.boolean().optional()
});
/**
 * Схемы валидации для запросов
 */
exports.querySchema = {
    pagination: [
        (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
        (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
    ],
    sort: [
        (0, express_validator_1.query)('sortBy').optional().isString().withMessage('Поле сортировки должно быть строкой'),
        (0, express_validator_1.query)('order').optional().isIn(['asc', 'desc']).withMessage('Порядок сортировки должен быть asc или desc'),
    ],
};
/**
 * Схемы валидации для свойств в запросах
 */
exports.propertyQuerySchema = {
    search: [
        ...exports.querySchema.pagination,
        ...exports.querySchema.sort,
        (0, express_validator_1.query)('city').optional().isString().withMessage('Город должен быть строкой'),
        (0, express_validator_1.query)('country').optional().isString().withMessage('Страна должна быть строкой'),
        (0, express_validator_1.query)('minPrice').optional().isNumeric().withMessage('Минимальная цена должна быть числом'),
        (0, express_validator_1.query)('maxPrice').optional().isNumeric().withMessage('Максимальная цена должна быть числом'),
        (0, express_validator_1.query)('propertyType').optional().isString().withMessage('Тип недвижимости должен быть строкой'),
        (0, express_validator_1.query)('bedrooms').optional().isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
        (0, express_validator_1.query)('bathrooms').optional().isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
        (0, express_validator_1.query)('maxGuests').optional().isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
    ],
};
