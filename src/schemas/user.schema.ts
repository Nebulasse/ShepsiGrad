import { z } from 'zod';
import { UserRole } from '../models/User';

/**
 * Схема для создания пользователя
 */
export const createUser = z.object({
  body: z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа'),
    phoneNumber: z.string().optional(),
    role: z.enum([UserRole.USER, UserRole.LANDLORD, UserRole.ADMIN]).optional()
  })
});

/**
 * Схема для обновления профиля пользователя
 */
export const updateProfile = z.object({
  body: z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').optional(),
    phoneNumber: z.string().optional(),
    profileImage: z.string().optional()
  })
});

/**
 * Схема для обновления пользователя администратором
 */
export const updateUser = z.object({
  body: z.object({
    firstName: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
    lastName: z.string().min(2, 'Фамилия должна содержать минимум 2 символа').optional(),
    phoneNumber: z.string().optional(),
    role: z.enum([UserRole.USER, UserRole.LANDLORD, UserRole.ADMIN]).optional(),
    isActive: z.boolean().optional(),
    emailVerified: z.boolean().optional()
  })
});

/**
 * Схема для обновления статуса пользователя
 */
export const updateUserStatus = z.object({
  body: z.object({
    isActive: z.boolean(),
    reason: z.string().optional()
  })
});

/**
 * Схема для изменения пароля
 */
export const changePassword = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Текущий пароль обязателен'),
    newPassword: z.string().min(8, 'Новый пароль должен содержать минимум 8 символов'),
    confirmPassword: z.string().min(8, 'Подтверждение пароля должно содержать минимум 8 символов')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword']
  })
}); 