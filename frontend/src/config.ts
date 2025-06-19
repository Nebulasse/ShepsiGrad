export const APP_ID = 'web-app';

// API и URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

// Supabase
export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Маршруты
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: '/properties/:id',
  MAP: '/map',
  CHATS: '/chats',
  CHAT_DETAILS: '/chats/:chatId',
  PROFILE: '/profile'
};

// Ошибки
export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Ошибка аутентификации',
  CONNECTION_ERROR: 'Ошибка соединения с сервером',
  PERMISSION_DENIED: 'Доступ запрещен',
  NOT_FOUND: 'Ресурс не найден',
  SERVER_ERROR: 'Внутренняя ошибка сервера',
  VALIDATION_ERROR: 'Ошибка валидации данных',
};

// Локальное хранилище
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  MAP_PREFERENCES: 'map_preferences',
};