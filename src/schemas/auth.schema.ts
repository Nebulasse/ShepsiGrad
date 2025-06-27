import { z } from 'zod';
import { UserRole } from '../models/User';

// Схема для регистрации пользователя
export const register = z.object({
  body: z.object({
    email: z.string().email({ message: 'Введите корректный email' }),
    password: z.string().min(8, { message: 'Пароль должен содержать минимум 8 символов' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
        message: 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру' 
      }),
    firstName: z.string().min(2, { message: 'Имя должно содержать минимум 2 символа' }),
    lastName: z.string().min(2, { message: 'Фамилия должна содержать минимум 2 символа' }),
    phoneNumber: z.string().optional(),
    role: z.nativeEnum(UserRole).optional()
  })
});

// Схема для входа пользователя
export const login = z.object({
  body: z.object({
    email: z.string().email({ message: 'Введите корректный email' }),
    password: z.string().min(1, { message: 'Введите пароль' })
  })
});

// Схема для запроса сброса пароля
export const forgotPassword = z.object({
  body: z.object({
    email: z.string().email({ message: 'Введите корректный email' })
  })
});

// Схема для сброса пароля
export const resetPassword = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'Токен обязателен' }),
    newPassword: z.string().min(8, { message: 'Пароль должен содержать минимум 8 символов' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
        message: 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру' 
      })
  })
});

// Схема для обновления токенов
export const refreshToken = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  })
});

// Схема для изменения пароля
export const changePassword = z.object({
  body: z.object({
    currentPassword: z.string().min(1, { message: 'Введите текущий пароль' }),
    newPassword: z.string().min(8, { message: 'Новый пароль должен содержать минимум 8 символов' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
        message: 'Пароль должен содержать хотя бы одну строчную букву, одну заглавную букву и одну цифру' 
      })
  })
}); 