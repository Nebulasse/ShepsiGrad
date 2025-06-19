import Joi from 'joi';

export const validateAuth = {
  // Валидация данных для регистрации
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    full_name: Joi.string().min(2).max(100).required(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('user', 'landlord').default('user')
  }),

  // Валидация данных для входа
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Валидация данных для авторизации через соцсети
  socialLogin: Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email().required(),
    provider: Joi.string().valid('google', 'facebook', 'vk').required(),
    full_name: Joi.string().optional(),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
  }),

  // Валидация данных для отправки OTP на телефон
  sendOtp: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
  }),

  // Валидация данных для входа через OTP
  verifyOtp: Joi.object({
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  // Валидация данных для обновления токена
  refreshToken: Joi.object({
    refresh_token: Joi.string().required()
  }),

  // Валидация данных для сброса пароля
  resetPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  // Валидация данных для обновления пароля
  updatePassword: Joi.object({
    newPassword: Joi.string().min(8).required()
  })
}; 