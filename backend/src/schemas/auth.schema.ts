import Joi from 'joi';
import { UserRole } from '../models/user.model';

// Схема для валидации данных при регистрации пользователя
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'string.empty': 'Email не может быть пустым',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.min': 'Пароль должен содержать минимум 8 символов',
      'string.empty': 'Пароль не может быть пустым',
      'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
      'any.required': 'Пароль обязателен',
    }),
  firstName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Имя не может быть пустым',
      'any.required': 'Имя обязательно',
    }),
  lastName: Joi.string()
    .required()
    .messages({
      'string.empty': 'Фамилия не может быть пустой',
      'any.required': 'Фамилия обязательна',
    }),
  phone: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Некорректный формат телефона',
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.USER)
    .messages({
      'any.only': 'Недопустимая роль',
    }),
});

// Схема для валидации данных при входе
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'string.empty': 'Email не может быть пустым',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Пароль не может быть пустым',
      'any.required': 'Пароль обязателен',
    }),
});

// Схема для валидации токена обновления
export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Токен обновления не может быть пустым',
      'any.required': 'Токен обновления обязателен',
    }),
});

// Схема для валидации токена подтверждения email
export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Токен не может быть пустым',
      'any.required': 'Токен обязателен',
    }),
});

// Схема для валидации запроса на сброс пароля
export const requestPasswordResetSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Некорректный формат email',
      'string.empty': 'Email не может быть пустым',
      'any.required': 'Email обязателен',
    }),
});

// Схема для валидации сброса пароля
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Токен не может быть пустым',
      'any.required': 'Токен обязателен',
    }),
  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
      'string.min': 'Пароль должен содержать минимум 8 символов',
      'string.empty': 'Пароль не может быть пустым',
      'string.pattern.base': 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
      'any.required': 'Пароль обязателен',
    }),
}); 