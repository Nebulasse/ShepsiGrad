/**
 * Конфигурация модулей для приложения арендодателей
 * Содержит настройки и константы для различных модулей приложения
 */

import { APP_CONFIG, STORE_CONFIG } from './config';

// Типы для конфигурации модулей
export type ModulePermission = 'read' | 'write' | 'admin';

export interface ModuleConfig {
  id: string;
  name: string;
  icon: string;
  route: string;
  enabled: boolean;
  requiredPermissions: ModulePermission[];
  features: Record<string, boolean>;
  order: number;
}

// Базовые настройки приложения
export const appConfig = {
  name: 'ShepsiGrad Landlord',
  version: '1.0.0',
  apiUrl: process.env.API_URL || 'https://api.shepsigrad.com',
  imageBaseUrl: 'https://storage.shepsigrad.com',
  supportEmail: 'support@shepsigrad.com',
  supportPhone: '+7 (800) 123-45-67',
  defaultLanguage: 'ru',
  defaultCurrency: 'RUB',
};

// Настройки модуля аутентификации
export const authConfig = {
  tokenStorageKey: 'shepsigrad_landlord_token',
  refreshTokenStorageKey: 'shepsigrad_landlord_refresh_token',
  userStorageKey: 'shepsigrad_landlord_user',
  sessionTimeout: 30 * 24 * 60 * 60 * 1000, // 30 дней в миллисекундах
  loginEndpoint: '/auth/landlord/login',
  registerEndpoint: '/auth/landlord/register',
  refreshTokenEndpoint: '/auth/landlord/refresh',
  resetPasswordEndpoint: '/auth/landlord/reset-password',
  socialAuthProviders: ['google', 'apple', 'vk'],
};

// Настройки модуля объектов недвижимости
export const propertyConfig = {
  maxImagesPerProperty: 20,
  maxImageSizeMB: 5,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  propertyTypes: [
    { id: 'apartment', label: 'Апартаменты', icon: 'apartment' },
    { id: 'house', label: 'Дом', icon: 'house' },
    { id: 'villa', label: 'Вилла', icon: 'villa' },
    { id: 'hotel', label: 'Отель', icon: 'hotel' },
  ],
  amenities: [
    { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
    { id: 'parking', label: 'Парковка', icon: 'car' },
    { id: 'pool', label: 'Бассейн', icon: 'water' },
    { id: 'aircon', label: 'Кондиционер', icon: 'snow' },
    { id: 'kitchen', label: 'Кухня', icon: 'restaurant' },
    { id: 'tv', label: 'Телевизор', icon: 'tv' },
    { id: 'washer', label: 'Стиральная машина', icon: 'water-outline' },
    { id: 'heating', label: 'Отопление', icon: 'flame' },
    { id: 'workspace', label: 'Рабочее место', icon: 'laptop' },
    { id: 'pet_friendly', label: 'Можно с питомцами', icon: 'paw' },
  ],
  defaultSortOptions: [
    { id: 'newest', label: 'Сначала новые' },
    { id: 'price_asc', label: 'Сначала дешевые' },
    { id: 'price_desc', label: 'Сначала дорогие' },
    { id: 'rating', label: 'По рейтингу' },
  ],
};

// Настройки модуля бронирований
export const bookingConfig = {
  minBookingDuration: 1, // минимальное количество дней для бронирования
  maxBookingDuration: 90, // максимальное количество дней для бронирования
  maxGuestsDefault: 10, // максимальное количество гостей по умолчанию
  bookingStatuses: {
    pending: { label: 'Ожидает подтверждения', color: '#FFC107' },
    confirmed: { label: 'Подтверждено', color: '#4CAF50' },
    cancelled: { label: 'Отменено', color: '#F44336' },
    completed: { label: 'Завершено', color: '#2196F3' },
  },
  cancellationPolicies: [
    { id: 'flexible', label: 'Гибкая', description: 'Полный возврат за 24 часа до заезда' },
    { id: 'moderate', label: 'Умеренная', description: 'Полный возврат за 5 дней до заезда' },
    { id: 'strict', label: 'Строгая', description: 'Полный возврат за 7 дней до заезда, 50% возврат до 24 часов' },
  ],
};

// Настройки модуля финансов
export const financeConfig = {
  currency: 'RUB',
  currencySymbol: '₽',
  serviceFeePercent: 5,
  paymentMethods: ['card', 'bank_transfer'],
  minWithdrawalAmount: 1000,
  withdrawalProcessingDays: 3,
  transactionTypes: {
    income: { label: 'Доход', color: '#4CAF50' },
    payout: { label: 'Выплата', color: '#2196F3' },
    fee: { label: 'Комиссия', color: '#FF9800' },
  },
};

// Настройки модуля уведомлений
export const notificationConfig = {
  defaultChannels: {
    email: true,
    push: true,
    sms: false,
  },
  notificationTypes: {
    new_booking: { label: 'Новое бронирование', defaultEnabled: true },
    booking_cancelled: { label: 'Отмена бронирования', defaultEnabled: true },
    booking_reminder: { label: 'Напоминание о бронировании', defaultEnabled: true },
    payment_received: { label: 'Получен платеж', defaultEnabled: true },
    new_review: { label: 'Новый отзыв', defaultEnabled: true },
    new_message: { label: 'Новое сообщение', defaultEnabled: true },
  },
};

// Настройки модуля чата
export const chatConfig = {
  maxMessageLength: 1000,
  maxAttachmentSizeMB: 10,
  supportedAttachmentTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  messageStatuses: {
    sent: { label: 'Отправлено', icon: 'checkmark' },
    delivered: { label: 'Доставлено', icon: 'checkmark-done' },
    read: { label: 'Прочитано', icon: 'checkmark-done-outline' },
  },
};

// Настройки модуля календаря
export const CALENDAR_CONFIG = {
  bookingStatuses: [
    { id: 'pending', label: 'Ожидает подтверждения', color: '#FFC107' },
    { id: 'confirmed', label: 'Подтверждено', color: '#4CAF50' },
    { id: 'cancelled', label: 'Отменено', color: '#F44336' },
    { id: 'completed', label: 'Завершено', color: '#2196F3' },
  ],
  paymentStatuses: [
    { id: 'pending', label: 'Ожидает оплаты', color: '#FFC107' },
    { id: 'partial', label: 'Частично оплачено', color: '#FF9800' },
    { id: 'paid', label: 'Полностью оплачено', color: '#4CAF50' },
    { id: 'refunded', label: 'Возвращено', color: '#9E9E9E' },
    { id: 'failed', label: 'Ошибка оплаты', color: '#F44336' },
  ],
  blockReasons: [
    { id: 'maintenance', label: 'Техническое обслуживание' },
    { id: 'renovation', label: 'Ремонт' },
    { id: 'personal_use', label: 'Личное использование' },
    { id: 'other', label: 'Другое' },
  ],
};

// Настройки модуля цен
export const PRICING_CONFIG = {
  seasonTypes: [
    { id: 'low', label: 'Низкий сезон', defaultMultiplier: 0.8 },
    { id: 'standard', label: 'Стандартный сезон', defaultMultiplier: 1.0 },
    { id: 'high', label: 'Высокий сезон', defaultMultiplier: 1.2 },
    { id: 'peak', label: 'Пиковый сезон', defaultMultiplier: 1.5 },
  ],
  discountTypes: [
    { id: 'weekly', label: 'Недельная скидка', defaultPercent: 5 },
    { id: 'monthly', label: 'Месячная скидка', defaultPercent: 15 },
    { id: 'early_bird', label: 'Раннее бронирование', defaultPercent: 10 },
    { id: 'last_minute', label: 'Горящее предложение', defaultPercent: 10 },
  ],
  defaultSeasons: [
    { 
      name: 'Низкий сезон (Осень)',
      startDate: '2024-10-01',
      endDate: '2024-11-30',
      multiplier: 0.8
    },
    { 
      name: 'Высокий сезон (Лето)',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      multiplier: 1.3
    },
    { 
      name: 'Новогодние праздники',
      startDate: '2024-12-20',
      endDate: '2025-01-10',
      multiplier: 1.5
    }
  ],
  weekendMultiplier: 1.2, // Множитель цены для выходных дней
  minStayDefault: 1, // Минимальное количество ночей по умолчанию
  maxStayDefault: 30, // Максимальное количество ночей по умолчанию
  currency: 'RUB', // Валюта по умолчанию
};

// Настройки модуля аналитики
export const analyticsConfig = {
  defaultDateRange: 'month', // 'week', 'month', 'year'
  metrics: {
    occupancy_rate: { label: 'Заполняемость', unit: '%' },
    average_daily_rate: { label: 'Средняя цена за ночь', unit: '₽' },
    revenue_per_available_room: { label: 'Доход на доступный номер', unit: '₽' },
    total_revenue: { label: 'Общий доход', unit: '₽' },
    booking_conversion_rate: { label: 'Конверсия бронирований', unit: '%' },
  },
};

// Конфигурация модуля объектов недвижимости
export const PROPERTY_MODULE: ModuleConfig = {
  id: 'properties',
  name: 'Объекты',
  icon: 'home',
  route: '/properties',
  enabled: true,
  requiredPermissions: ['read'],
  features: {
    create: true,
    edit: true,
    delete: true,
    calendar: true,
    pricing: true,
    images: true,
    amenities: true,
    rules: true,
    availability: true,
  },
  order: 1,
};

// Конфигурация модуля бронирований
export const BOOKING_MODULE: ModuleConfig = {
  id: 'bookings',
  name: 'Бронирования',
  icon: 'calendar',
  route: '/bookings',
  enabled: true,
  requiredPermissions: ['read'],
  features: {
    approve: true,
    reject: true,
    cancel: true,
    modify: true,
    calendar: true,
    payments: true,
    reviews: true,
  },
  order: 2,
};

// Конфигурация модуля чата
export const CHAT_MODULE: ModuleConfig = {
  id: 'chat',
  name: 'Сообщения',
  icon: 'message-circle',
  route: '/chat',
  enabled: true,
  requiredPermissions: ['read', 'write'],
  features: {
    realtime: true,
    attachments: false,
    notifications: true,
    typing: true,
    history: true,
  },
  order: 3,
};

// Конфигурация модуля финансов
export const FINANCE_MODULE: ModuleConfig = {
  id: 'finances',
  name: 'Финансы',
  icon: 'dollar-sign',
  route: '/finances',
  enabled: true,
  requiredPermissions: ['read'],
  features: {
    analytics: true,
    reports: true,
    transactions: true,
    payouts: true,
    taxes: true,
    export: true,
  },
  order: 4,
};

// Конфигурация модуля профиля
export const PROFILE_MODULE: ModuleConfig = {
  id: 'profile',
  name: 'Профиль',
  icon: 'user',
  route: '/profile',
  enabled: true,
  requiredPermissions: ['read', 'write'],
  features: {
    edit: true,
    verification: true,
    documents: true,
    notifications: true,
    security: true,
    payments: true,
  },
  order: 5,
};

// Конфигурация модуля аналитики
export const ANALYTICS_MODULE: ModuleConfig = {
  id: 'analytics',
  name: 'Аналитика',
  icon: 'bar-chart',
  route: '/analytics',
  enabled: true,
  requiredPermissions: ['read'],
  features: {
    dashboard: true,
    reports: true,
    export: true,
    insights: true,
  },
  order: 6,
};

// Список всех модулей
export const ALL_MODULES = [
  PROPERTY_MODULE,
  BOOKING_MODULE,
  CHAT_MODULE,
  FINANCE_MODULE,
  PROFILE_MODULE,
  ANALYTICS_MODULE,
];

// Функция для получения доступных модулей на основе разрешений пользователя
export const getAvailableModules = (userPermissions: Record<string, ModulePermission[]>) => {
  return ALL_MODULES.filter(module => {
    // Проверяем, включен ли модуль
    if (!module.enabled) return false;
    
    // Проверяем, есть ли у пользователя необходимые разрешения
    const modulePerms = userPermissions[module.id] || [];
    return module.requiredPermissions.every(perm => modulePerms.includes(perm));
  }).sort((a, b) => a.order - b.order);
};

// Объединенная конфигурация всех модулей
export const MODULE_CONFIG = {
  property: PROPERTY_MODULE,
  booking: BOOKING_MODULE,
  chat: CHAT_MODULE,
  finance: FINANCE_MODULE,
  profile: PROFILE_MODULE,
  analytics: ANALYTICS_MODULE,
};

// Функция для проверки доступности функции в модуле
export function isFeatureEnabled(module: keyof typeof MODULE_CONFIG, feature: string): boolean {
  const moduleConfig = MODULE_CONFIG[module];
  if (!moduleConfig || !moduleConfig.enabled) {
    return false;
  }
  
  return moduleConfig.features[feature as keyof typeof moduleConfig.features] === true;
}

// Экспорт всех настроек модулей
export default MODULE_CONFIG;

// Базовая конфигурация API
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.shepsigrad.com',
  timeout: 30000, // 30 секунд
};

// Настройки для карты
export const mapConfig = {
  initialRegion: {
    latitude: 43.5992, // Шепси
    longitude: 39.1492,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  mapStyle: 'standard', // 'standard', 'satellite', 'hybrid'
  clusteringEnabled: true,
  clusteringRadius: 50,
};

// Настройки для изображений
export const imageConfig = {
  maxUploadSize: 5 * 1024 * 1024, // 5MB
  maxImagesPerProperty: 15,
  compressionQuality: 0.8,
  thumbnailSize: {
    width: 300,
    height: 200,
  },
  formats: ['jpg', 'jpeg', 'png', 'webp'],
};

// Типы недвижимости
export const propertyTypes = [
  { id: 'apartment', label: 'Квартира' },
  { id: 'house', label: 'Дом' },
  { id: 'room', label: 'Комната' },
  { id: 'hotel', label: 'Отель' },
  { id: 'hostel', label: 'Хостел' },
  { id: 'villa', label: 'Вилла' },
  { id: 'cottage', label: 'Коттедж' },
];

// Удобства
export const amenities = [
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'air_conditioning', label: 'Кондиционер', icon: 'snow' },
  { id: 'kitchen', label: 'Кухня', icon: 'restaurant' },
  { id: 'washing_machine', label: 'Стиральная машина', icon: 'water' },
  { id: 'tv', label: 'Телевизор', icon: 'tv' },
  { id: 'heating', label: 'Отопление', icon: 'flame' },
  { id: 'iron', label: 'Утюг', icon: 'shirt' },
  { id: 'hair_dryer', label: 'Фен', icon: 'hand-left' },
  { id: 'pool', label: 'Бассейн', icon: 'water' },
  { id: 'parking', label: 'Парковка', icon: 'car' },
  { id: 'elevator', label: 'Лифт', icon: 'arrow-up-circle' },
  { id: 'workspace', label: 'Рабочее место', icon: 'desktop' },
  { id: 'baby_friendly', label: 'Подходит для детей', icon: 'happy' },
  { id: 'pet_friendly', label: 'Можно с питомцами', icon: 'paw' },
  { id: 'smoking_allowed', label: 'Курение разрешено', icon: 'flame' },
  { id: 'events_allowed', label: 'Мероприятия разрешены', icon: 'people' },
];

// Правила дома
export const houseRules = [
  { id: 'no_smoking', label: 'Курение запрещено' },
  { id: 'no_pets', label: 'Питомцы не разрешены' },
  { id: 'no_parties', label: 'Вечеринки запрещены' },
  { id: 'quiet_hours', label: 'Тихие часы с 22:00 до 8:00' },
  { id: 'check_in_time', label: 'Заезд с 14:00' },
  { id: 'check_out_time', label: 'Выезд до 12:00' },
];

// Настройки для чата
export const CHAT_CONFIG_EXTENDED = {
  messageTypes: [
    { id: 'text', label: 'Текстовое сообщение' },
    { id: 'image', label: 'Изображение' },
    { id: 'booking', label: 'Информация о бронировании' },
    { id: 'payment', label: 'Информация об оплате' },
    { id: 'system', label: 'Системное сообщение' },
  ],
  maxImageSize: 2 * 1024 * 1024, // 2MB
  maxMessageLength: 1000,
  autoResponseTemplates: [
    { id: 'greeting', text: 'Здравствуйте! Спасибо за интерес к моему объявлению. Чем могу помочь?' },
    { id: 'booking_info', text: 'Для бронирования, пожалуйста, укажите даты заезда и выезда, а также количество гостей.' },
    { id: 'pricing_info', text: 'Цена может меняться в зависимости от сезона и количества гостей. Пожалуйста, уточните даты для точного расчета.' },
    { id: 'contact_info', text: 'Вы можете связаться со мной по телефону или через этот чат для получения дополнительной информации.' },
  ],
};

// Настройки для уведомлений
export const NOTIFICATION_CONFIG_EXTENDED = {
  types: [
    { id: 'booking_request', label: 'Запрос на бронирование', priority: 'high' },
    { id: 'booking_confirmed', label: 'Бронирование подтверждено', priority: 'high' },
    { id: 'booking_cancelled', label: 'Бронирование отменено', priority: 'high' },
    { id: 'payment_received', label: 'Получена оплата', priority: 'high' },
    { id: 'new_message', label: 'Новое сообщение', priority: 'medium' },
    { id: 'new_review', label: 'Новый отзыв', priority: 'medium' },
    { id: 'system', label: 'Системное уведомление', priority: 'low' },
  ],
  channels: [
    { id: 'app', label: 'В приложении', enabled: true },
    { id: 'email', label: 'Email', enabled: true },
    { id: 'sms', label: 'SMS', enabled: false },
    { id: 'push', label: 'Push-уведомления', enabled: true },
  ],
};

// Конфигурация для модуля аналитики
export const ANALYTICS_CONFIG = {
  enabled: true,
  providers: {
    firebase: {
      enabled: true,
      trackScreenViews: true,
      trackUserProperties: true,
      trackAppOpen: true,
    },
    amplitude: {
      enabled: false,
      apiKey: '',
    },
    yandexMetrica: {
      enabled: false,
      apiKey: '',
    },
  },
  events: {
    // События авторизации
    LOGIN: 'login',
    REGISTER: 'register',
    LOGOUT: 'logout',
    PASSWORD_RESET: 'password_reset',
    
    // События объектов недвижимости
    PROPERTY_VIEW: 'property_view',
    PROPERTY_ADD: 'property_add',
    PROPERTY_EDIT: 'property_edit',
    PROPERTY_DELETE: 'property_delete',
    PROPERTY_PUBLISH: 'property_publish',
    PROPERTY_UNPUBLISH: 'property_unpublish',
    
    // События бронирований
    BOOKING_VIEW: 'booking_view',
    BOOKING_ACCEPT: 'booking_accept',
    BOOKING_REJECT: 'booking_reject',
    BOOKING_CANCEL: 'booking_cancel',
    
    // События чата
    CHAT_OPEN: 'chat_open',
    MESSAGE_SEND: 'message_send',
    
    // События приложения
    APP_RATE: 'app_rate',
    APP_SHARE: 'app_share',
    APP_ERROR: 'app_error',
    APP_UPDATE: 'app_update',
  },
};

// Конфигурация для модуля обновлений
export const UPDATE_CONFIG = {
  checkOnLaunch: true,
  forceUpdate: false,
  minRequiredVersion: '1.0.0',
  updateUrl: STORE_CONFIG.rustore.enabled 
    ? STORE_CONFIG.rustore.appUrl 
    : STORE_CONFIG.playStore.appUrl,
};

// Конфигурация для модуля отзывов и рейтингов
export const RATING_CONFIG = {
  minSessionsBeforePrompt: 3,
  daysBeforeReminding: 7,
  minDaysSinceInstall: 2,
  promptTitle: 'Оцените приложение',
  promptMessage: 'Если вам нравится наше приложение, пожалуйста, оцените его. Это поможет нам стать лучше!',
  promptNegativeButtonText: 'Не сейчас',
  promptPositiveButtonText: 'Оценить',
  promptNeverButtonText: 'Больше не спрашивать',
  storeUrl: STORE_CONFIG.rustore.enabled 
    ? STORE_CONFIG.rustore.appUrl 
    : STORE_CONFIG.playStore.appUrl,
};

// Конфигурация для модуля поддержки
export const SUPPORT_CONFIG = {
  email: 'support@shepsigrad.com',
  phone: '+7 (800) 123-45-67',
  website: 'https://shepsigrad.com/support',
  faq: 'https://shepsigrad.com/faq',
  socialMedia: {
    telegram: 'https://t.me/shepsigrad',
    vk: 'https://vk.com/shepsigrad',
  },
};

// Конфигурация для модуля глубоких ссылок
export const DEEP_LINKING_CONFIG = {
  enabled: true,
  prefix: 'shepsigrad://',
  schemes: ['shepsigrad', 'shepsigrad-landlord'],
};

// Конфигурация для модуля кэширования
export const CACHE_CONFIG = {
  enabled: true,
  ttl: 3600, // Время жизни кэша в секундах
  maxSize: 50 * 1024 * 1024, // Максимальный размер кэша в байтах (50MB)
};

// Конфигурация для модуля логирования
export const LOGGING_CONFIG = {
  enabled: true,
  level: __DEV__ ? 'debug' : 'error',
  remote: {
    enabled: !__DEV__,
    url: 'https://logs.shepsigrad.com/api/logs',
  },
};

// Конфигурация для модуля офлайн-режима
export const OFFLINE_CONFIG = {
  enabled: true,
  syncInterval: 60000, // Интервал синхронизации в миллисекундах
  maxRetries: 5, // Максимальное количество попыток синхронизации
  retryDelay: 5000, // Задержка между попытками в миллисекундах
};

// Конфигурация для модуля уведомлений о магазине приложений
export const STORE_NOTIFICATION_CONFIG = {
  enabled: true,
  checkSource: true,
  rustore: {
    title: 'Установите из RuStore',
    message: 'Для лучшей работы приложения рекомендуем установить его из RuStore',
    buttonText: 'Перейти в RuStore',
    url: STORE_CONFIG.rustore.appUrl,
  },
}; 