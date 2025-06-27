/**
 * Основной файл конфигурации приложения арендодателей ShepsiGrad
 */

// Базовые настройки приложения
export const APP_CONFIG = {
  name: 'ShepsiGrad Landlord',
  version: '1.0.0',
  buildNumber: 1,
  primaryColor: '#4D8EFF',
  secondaryColor: '#F0F7FF',
  accentColor: '#FF3B30',
  successColor: '#4CAF50',
  warningColor: '#FFC107',
  dangerColor: '#F44336',
};

// Настройки API
export const API_CONFIG = {
  baseUrl: 'https://shepsigrad-api.onrender.com', // URL тестового бэкенда
  timeout: 10000, // Таймаут запросов в миллисекундах
  appId: 'landlord-app', // Идентификатор приложения
  appType: 'landlord', // Тип приложения
};

// Для совместимости со старым кодом
export const API_URL = API_CONFIG.baseUrl;

// Настройки Supabase
export const SUPABASE_CONFIG = {
  url: 'https://your-supabase-project-url.supabase.co',
  anonKey: 'your-anon-key',
  serviceKey: 'your-service-key', // Только для серверной части
  tables: {
    landlords: 'landlords',
    properties: 'properties',
    bookings: 'bookings',
    reviews: 'reviews',
    chats: 'chats',
    messages: 'messages',
  },
};

// Настройки аутентификации
export const AUTH_CONFIG = {
  tokenStorageKey: 'shepsigrad_landlord_token',
  refreshTokenStorageKey: 'shepsigrad_landlord_refresh_token',
  userStorageKey: 'shepsigrad_landlord_user',
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
  endpoints: {
    login: '/auth/landlord/login',
    register: '/auth/landlord/register',
    refreshToken: '/auth/landlord/refresh',
    resetPassword: '/auth/landlord/reset-password',
    logout: '/auth/landlord/logout',
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID || '',
    },
    apple: {
      enabled: true,
    },
    vk: {
      enabled: true,
      clientId: process.env.VK_CLIENT_ID || '',
    },
  },
};

// Настройки хранения данных
export const STORAGE_CONFIG = {
  imageBaseUrl: 'https://storage.shepsigrad.com',
  maxImageSizeMB: 5,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImagesPerProperty: 20,
  compressionQuality: 0.8, // 0 - максимальное сжатие, 1 - без сжатия
};

// Настройки уведомлений
export const NOTIFICATION_CONFIG = {
  enabled: true, // Включены ли уведомления
  refreshInterval: 60000, // Интервал обновления уведомлений в миллисекундах
  defaultChannels: {
    email: true,
    push: true,
    sms: false,
  },
  types: {
    NEW_BOOKING: {
      id: 'new_booking',
      title: 'Новое бронирование',
      defaultEnabled: true,
      priority: 'high',
    },
    BOOKING_CANCELLED: {
      id: 'booking_cancelled',
      title: 'Отмена бронирования',
      defaultEnabled: true,
      priority: 'high',
    },
    BOOKING_REMINDER: {
      id: 'booking_reminder',
      title: 'Напоминание о бронировании',
      defaultEnabled: true,
      priority: 'normal',
    },
    PAYMENT_RECEIVED: {
      id: 'payment_received',
      title: 'Получен платеж',
      defaultEnabled: true,
      priority: 'high',
    },
    NEW_REVIEW: {
      id: 'new_review',
      title: 'Новый отзыв',
      defaultEnabled: true,
      priority: 'normal',
    },
    NEW_MESSAGE: {
      id: 'new_message',
      title: 'Новое сообщение',
      defaultEnabled: true,
      priority: 'normal',
    },
  },
};

// Настройки локализации
export const LOCALIZATION_CONFIG = {
  defaultLanguage: 'ru',
  supportedLanguages: [
    { code: 'ru', name: 'Русский' },
    { code: 'en', name: 'English' },
  ],
  defaultCurrency: 'RUB',
  supportedCurrencies: [
    { code: 'RUB', symbol: '₽', name: 'Российский рубль' },
    { code: 'USD', symbol: '$', name: 'Доллар США' },
    { code: 'EUR', symbol: '€', name: 'Евро' },
  ],
  dateFormat: 'DD.MM.YYYY',
  timeFormat: 'HH:mm',
};

// Настройки для отладки
export const DEBUG_CONFIG = {
  enableLogs: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV !== 'production' ? 'debug' : 'error',
  enableNetworkLogs: process.env.NODE_ENV !== 'production',
};

// Конфигурация для синхронизации
export const SYNC_CONFIG = {
  enabled: true, // Включена ли синхронизация
  reconnectAttempts: 5, // Количество попыток переподключения
  reconnectDelay: 1000, // Задержка между попытками в миллисекундах
};

// Конфигурация для карт
export const MAP_CONFIG = {
  defaultLatitude: 44.0095, // Широта по умолчанию (Шепси)
  defaultLongitude: 39.1515, // Долгота по умолчанию (Шепси)
  defaultZoom: 13, // Масштаб по умолчанию
};

// Конфигурация для загрузки изображений
export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // Максимальный размер изображения в байтах (5MB)
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'], // Разрешенные типы изображений
  maxWidth: 2048, // Максимальная ширина изображения в пикселях
  maxHeight: 2048, // Максимальная высота изображения в пикселях
  quality: 0.8, // Качество сжатия изображения (0-1)
};

// Конфигурация для платежей
export const PAYMENT_CONFIG = {
  currency: 'RUB', // Валюта платежей
  commission: 0.05, // Комиссия сервиса (5%)
};

// Конфигурация для бронирований
export const BOOKING_CONFIG = {
  minDaysBeforeCheckIn: 1, // Минимальное количество дней до заезда
  maxDaysInFuture: 365, // Максимальное количество дней в будущем для бронирования
  defaultMinStay: 1, // Минимальное количество дней бронирования по умолчанию
  defaultMaxStay: 30, // Максимальное количество дней бронирования по умолчанию
};

// Конфигурация для чата
export const CHAT_CONFIG = {
  messagesPerPage: 20, // Количество сообщений на страницу
  maxMessageLength: 1000, // Максимальная длина сообщения
  typingTimeout: 3000, // Таймаут для индикатора набора текста в миллисекундах
};

// Конфигурация для магазина приложений
export const STORE_CONFIG = {
  rustore: {
    enabled: true,
    appId: 'com.shepsigrad.landlord',
    appUrl: 'https://apps.rustore.ru/app/com.shepsigrad.landlord',
  },
  playStore: {
    enabled: false,
    appId: 'com.shepsigrad.landlord',
    appUrl: 'https://play.google.com/store/apps/details?id=com.shepsigrad.landlord',
  },
  appStore: {
    enabled: false,
    appId: 'com.shepsigrad.landlord',
    appUrl: 'https://apps.apple.com/app/id123456789',
  },
};

// Объединенная конфигурация для экспорта
export const CONFIG = {
  api: API_CONFIG,
  supabase: SUPABASE_CONFIG,
  sync: SYNC_CONFIG,
  notification: NOTIFICATION_CONFIG,
  map: MAP_CONFIG,
  image: IMAGE_CONFIG,
  payment: PAYMENT_CONFIG,
  booking: BOOKING_CONFIG,
  chat: CHAT_CONFIG,
  store: STORE_CONFIG,
}; 