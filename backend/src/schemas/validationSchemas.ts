import { z } from 'zod';

// Схемы для аутентификации
export const authSchema = {
  register: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
    first_name: z.string().min(2, 'Имя должно содержать не менее 2 символов'),
    last_name: z.string().min(2, 'Фамилия должна содержать не менее 2 символов'),
    phone: z.string().optional(),
  }),
  login: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(1, 'Пароль не может быть пустым'),
  }),
  refreshToken: z.object({
    refresh_token: z.string().min(1, 'Токен обновления не может быть пустым'),
  }),
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
  updateProfile: z.object({
    first_name: z.string().min(2, 'Имя должно содержать не менее 2 символов').optional(),
    last_name: z.string().min(2, 'Фамилия должна содержать не менее 2 символов').optional(),
    phone: z.string().optional(),
    avatar_url: z.string().url('Некорректный URL аватара').optional(),
    bio: z.string().max(500, 'Биография не может превышать 500 символов').optional(),
  }),
  updatePassword: z.object({
    current_password: z.string().min(1, 'Текущий пароль не может быть пустым'),
    new_password: z.string().min(6, 'Новый пароль должен содержать не менее 6 символов'),
  }),
};

// Схемы для объектов недвижимости
export const propertySchema = {
  createProperty: z.object({
    title: z.string().min(5, 'Название должно содержать не менее 5 символов'),
    description: z.string().min(10, 'Описание должно содержать не менее 10 символов'),
    price: z.number().positive('Цена должна быть положительным числом'),
    location: z.object({
      city: z.string().min(2, 'Город должен содержать не менее 2 символов'),
      address: z.string().min(5, 'Адрес должен содержать не менее 5 символов'),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }),
    amenities: z.array(z.string()).optional(),
    max_guests: z.number().int().positive('Количество гостей должно быть положительным числом'),
    bedrooms: z.number().int().positive('Количество спален должно быть положительным числом'),
    bathrooms: z.number().int().positive('Количество ванных комнат должно быть положительным числом'),
    images: z.array(z.string().url('Некорректный URL изображения')).optional(),
  }),
  updateProperty: z.object({
    title: z.string().min(5, 'Название должно содержать не менее 5 символов').optional(),
    description: z.string().min(10, 'Описание должно содержать не менее 10 символов').optional(),
    price: z.number().positive('Цена должна быть положительным числом').optional(),
    location: z.object({
      city: z.string().min(2, 'Город должен содержать не менее 2 символов'),
      address: z.string().min(5, 'Адрес должен содержать не менее 5 символов'),
      coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
      }).optional(),
    }).optional(),
    amenities: z.array(z.string()).optional(),
    max_guests: z.number().int().positive('Количество гостей должно быть положительным числом').optional(),
    bedrooms: z.number().int().positive('Количество спален должно быть положительным числом').optional(),
    bathrooms: z.number().int().positive('Количество ванных комнат должно быть положительным числом').optional(),
    images: z.array(z.string().url('Некорректный URL изображения')).optional(),
  }),
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
  createBooking: z.object({
    property_id: z.string().min(1, 'ID объекта не может быть пустым'),
    check_in_date: z.string().or(z.date()),
    check_out_date: z.string().or(z.date()),
    guests: z.number().int().positive('Количество гостей должно быть положительным числом'),
    total_price: z.number().positive('Общая стоимость должна быть положительным числом'),
  }),
  updateBooking: z.object({
    status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'refunded']),
  }),
  createPayment: z.object({
    booking_id: z.string().min(1, 'ID бронирования не может быть пустым'),
  }),
  refundPayment: z.object({
    booking_id: z.string().min(1, 'ID бронирования не может быть пустым'),
  }),
};

// Схемы для отзывов
export const reviewSchema = {
  createReview: z.object({
    property_id: z.string().min(1, 'ID объекта не может быть пустым'),
    booking_id: z.string().optional(),
    rating: z.number().int().min(1, 'Минимальная оценка - 1').max(5, 'Максимальная оценка - 5'),
    comment: z.string().min(3, 'Комментарий должен содержать не менее 3 символов'),
  }),
  updateReview: z.object({
    rating: z.number().int().min(1, 'Минимальная оценка - 1').max(5, 'Максимальная оценка - 5'),
    comment: z.string().min(3, 'Комментарий должен содержать не менее 3 символов'),
  }),
  replyReview: z.object({
    reply: z.string().min(3, 'Ответ должен содержать не менее 3 символов'),
  }),
  moderateReview: z.object({
    is_hidden: z.boolean(),
  }),
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