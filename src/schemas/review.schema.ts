import { z } from 'zod';

// Схема для создания отзыва
export const createReview = z.object({
  body: z.object({
    propertyId: z.string().uuid({ message: 'Неверный формат ID объекта недвижимости' }),
    rating: z.number().int().min(1, { message: 'Рейтинг должен быть от 1 до 5' }).max(5, { message: 'Рейтинг должен быть от 1 до 5' }),
    comment: z.string().min(10, { message: 'Комментарий должен содержать минимум 10 символов' }),
    cleanliness: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    checkIn: z.number().int().min(1).max(5).optional(),
    accuracy: z.number().int().min(1).max(5).optional(),
    location: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
    bookingId: z.string().uuid({ message: 'Неверный формат ID бронирования' }).optional(),
    images: z.array(z.string().url({ message: 'Неверный формат URL изображения' })).optional()
  })
});

// Схема для обновления отзыва
export const updateReview = z.object({
  body: z.object({
    rating: z.number().int().min(1, { message: 'Рейтинг должен быть от 1 до 5' }).max(5, { message: 'Рейтинг должен быть от 1 до 5' }).optional(),
    comment: z.string().min(10, { message: 'Комментарий должен содержать минимум 10 символов' }).optional(),
    cleanliness: z.number().int().min(1).max(5).optional(),
    communication: z.number().int().min(1).max(5).optional(),
    checkIn: z.number().int().min(1).max(5).optional(),
    accuracy: z.number().int().min(1).max(5).optional(),
    location: z.number().int().min(1).max(5).optional(),
    value: z.number().int().min(1).max(5).optional(),
    images: z.array(z.string().url({ message: 'Неверный формат URL изображения' })).optional()
  })
});

// Схема для ответа владельца на отзыв
export const replyReview = z.object({
  body: z.object({
    reply: z.string().min(10, { message: 'Ответ должен содержать минимум 10 символов' })
  })
});

// Схема для модерации отзыва
export const moderateReview = z.object({
  body: z.object({
    isApproved: z.boolean().optional(),
    isHidden: z.boolean().optional(),
    adminComment: z.string().optional()
  })
}); 