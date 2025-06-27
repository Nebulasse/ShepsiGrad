/**
 * Константы для различных платформ
 * 
 * Этот файл содержит константы, которые могут отличаться
 * в зависимости от платформы (iOS, Android, Web)
 */

import { Platform } from 'react-native';

// Определяем, работаем ли мы с Hermes engine
export const IS_HERMES = typeof HermesInternal !== 'undefined';

// Определяем платформу
export const IS_IOS = Platform.OS === 'ios';
export const IS_ANDROID = Platform.OS === 'android';
export const IS_WEB = Platform.OS === 'web';

// Экспортируем платформенные константы
export const PLATFORM_CONSTANTS = {
  IS_HERMES,
  IS_IOS,
  IS_ANDROID,
  IS_WEB,
}; 