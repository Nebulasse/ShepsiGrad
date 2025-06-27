import { z } from 'zod';
import { body, param, query } from 'express-validator';

// Схемы для аутентификации
export const authSchema = {
  register: [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль должен содержать минимум 6 символов'),
    body('firstName').notEmpty().withMessage('Имя обязательно'),
    body('lastName').notEmpty().withMessage('Фамилия обязательна'),
    body('role')
      .optional()
      .isIn(['user', 'landlord'])
      .withMessage('Роль должна быть user или landlord'),
  ],
  login: [
    body('email').isEmail().withMessage('Введите корректный email'),
    body('password').notEmpty().withMessage('Пароль обязателен'),
  ],
  refreshToken: [
    body('refreshToken').notEmpty().withMessage('Refresh token обязателен'),
  ],
  resetPassword: z.object({
    email: z.string().email('Некорректный email'),
  }),
  changePassword: z.object({
    token: z.string().min(1, 'Токен не может быть пустым'),
    password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
  }),
};

// Схемы для пользователей
export const userSchema = {
  updateProfile: [
    body('firstName').optional().notEmpty().withMessage('Имя не может быть пустым'),
    body('lastName').optional().notEmpty().withMessage('Фамилия не может быть пустой'),
    body('phone').optional().isMobilePhone('any').withMessage('Введите корректный номер телефона'),
    body('email').optional().isEmail().withMessage('Введите корректный email'),
  ],
  updatePassword: z.object({
    current_password: z.string().min(1, 'Текущий пароль не может быть пустым'),
    new_password: z.string().min(6, 'Новый пароль должен содержать не менее 6 символов'),
  }),
};

// Схемы для объектов недвижимости
export const propertySchema = {
  create: [
    body('title').notEmpty().withMessage('Название обязательно'),
    body('description').notEmpty().withMessage('Описание обязательно'),
    body('price').isNumeric().withMessage('Цена должна быть числом'),
    body('address').notEmpty().withMessage('Адрес обязателен'),
    body('city').notEmpty().withMessage('Город обязателен'),
    body('country').notEmpty().withMessage('Страна обязательна'),
    body('propertyType')
      .notEmpty()
      .isIn(['apartment', 'house', 'room', 'hostel'])
      .withMessage('Недопустимый тип недвижимости'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
    body('bathrooms').isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
    body('maxGuests').isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
  ],
  update: [
    body('title').optional().notEmpty().withMessage('Название не может быть пустым'),
    body('description').optional().notEmpty().withMessage('Описание не может быть пустым'),
    body('price').optional().isNumeric().withMessage('Цена должна быть числом'),
    body('address').optional().notEmpty().withMessage('Адрес не может быть пустым'),
    body('city').optional().notEmpty().withMessage('Город не может быть пустым'),
    body('country').optional().notEmpty().withMessage('Страна не может быть пустой'),
    body('propertyType')
      .optional()
      .isIn(['apartment', 'house', 'room', 'hostel'])
      .withMessage('Недопустимый тип недвижимости'),
    body('bedrooms').optional().isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
    body('bathrooms').optional().isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
    body('maxGuests').optional().isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
  ],
  searchProperty: z.object({
    city: z.string().optional(),
    price_min: z.number().optional(),
    price_max: z.number().optional(),
    guests: z.number().int().optional(),
    bedrooms: z.number().int().optional(),
    amenities: z.array(z.string()).optional(),
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().optional(),
  }),
};

// Схемы для бронирований
export const bookingSchema = {
  create: [
    body('propertyId').notEmpty().withMessage('ID недвижимости обязателен'),
    body('checkIn').isISO8601().withMessage('Дата заезда должна быть в формате ISO8601'),
    body('checkOut').isISO8601().withMessage('Дата выезда должна быть в формате ISO8601'),
    body('guests').isInt({ min: 1 }).withMessage('Количество гостей должно быть положительным числом'),
  ],
  update: [
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'cancelled', 'completed'])
      .withMessage('Недопустимый статус бронирования'),
  ],
  createPayment: z.object({
    booking_id: z.string().min(1, 'ID бронирования не может быть пустым'),
  }),
  refundPayment: z.object({
    booking_id: z.string().min(1, 'ID бронирования не может быть пустым'),
  }),
};

// Схемы для отзывов
export const reviewSchema = {
  createReview: [
    body('propertyId').notEmpty().withMessage('ID недвижимости обязателен'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
    body('comment').notEmpty().withMessage('Комментарий обязателен'),
  ],
  updateReview: [
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Рейтинг должен быть от 1 до 5'),
    body('comment').optional().notEmpty().withMessage('Комментарий не может быть пустым'),
  ],
  replyReview: [
    body('reply').notEmpty().withMessage('Ответ обязателен'),
  ],
  moderateReview: [
    body('isApproved').isBoolean().withMessage('Поле isApproved должно быть булевым'),
    body('moderationComment').optional().isString().withMessage('Комментарий модерации должен быть строкой'),
  ],
};

// Схемы для чата
export const chatSchema = {
  createConversation: z.object({
    property_id: z.string().min(1, 'ID объекта не может быть пустым'),
    recipient_id: z.string().min(1, 'ID получателя не может быть пустым'),
    message: z.string().min(1, 'Сообщение не может быть пустым'),
  }),
  sendMessage: z.object({
    conversation_id: z.string().min(1, 'ID беседы не может быть пустым'),
    message: z.string().min(1, 'Сообщение не может быть пустым'),
  }),
};

// Схемы для избранного
export const favoriteSchema = {
  addFavorite: z.object({
    property_id: z.string().min(1, 'ID объекта не может быть пустым'),
  }),
};

// Схемы для уведомлений
export const notificationSchema = {
  markAsRead: z.object({
    notification_id: z.string().min(1, 'ID уведомления не может быть пустым'),
  }),
  markAllAsRead: z.object({}),
};

/**
 * Схема для валидации данных при обновлении профиля
 */
export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone_number: z.string().min(5).max(20).optional(),
  bio: z.string().max(500).optional(),
  notifications_enabled: z.boolean().optional(),
  email_notifications_enabled: z.boolean().optional()
});

/**
 * Схемы валидации для запросов
 */
export const querySchema = {
  pagination: [
    query('page').optional().isInt({ min: 1 }).withMessage('Страница должна быть положительным числом'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Лимит должен быть от 1 до 100'),
  ],
  sort: [
    query('sortBy').optional().isString().withMessage('Поле сортировки должно быть строкой'),
    query('order').optional().isIn(['asc', 'desc']).withMessage('Порядок сортировки должен быть asc или desc'),
  ],
};

/**
 * Схемы валидации для свойств в запросах
 */
export const propertyQuerySchema = {
  search: [
    ...querySchema.pagination,
    ...querySchema.sort,
    query('city').optional().isString().withMessage('Город должен быть строкой'),
    query('country').optional().isString().withMessage('Страна должна быть строкой'),
    query('minPrice').optional().isNumeric().withMessage('Минимальная цена должна быть числом'),
    query('maxPrice').optional().isNumeric().withMessage('Максимальная цена должна быть числом'),
    query('propertyType').optional().isString().withMessage('Тип недвижимости должен быть строкой'),
    query('bedrooms').optional().isInt({ min: 0 }).withMessage('Количество спален должно быть положительным числом'),
    query('bathrooms').optional().isInt({ min: 0 }).withMessage('Количество ванных должно быть положительным числом'),
    query('maxGuests').optional().isInt({ min: 1 }).withMessage('Максимальное количество гостей должно быть положительным числом'),
  ],
}; 