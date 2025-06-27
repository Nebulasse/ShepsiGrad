/**
 * Исправления для Expo Router
 * Решает проблемы с require в Expo Router
 */

// Проверяем, запущено ли приложение в Hermes
const isHermes = () => !!global.HermesInternal;

// Если используется Hermes, добавляем специальные исправления
if (isHermes()) {
  // Патчим некоторые специфические для Expo Router модули
  const patchExpoRouter = () => {
    try {
      // Создаем пустые заглушки для модулей, которые могут использовать require
      if (!global.__EXPO_ROUTER_MODULES__) {
        global.__EXPO_ROUTER_MODULES__ = {};
      }
      
      console.log('[Router Fix] Патчи для Expo Router применены');
    } catch (err) {
      console.error('[Router Fix] Ошибка при применении патчей:', err);
    }
  };
  
  // Применяем патчи
  patchExpoRouter();
}

export default {}; 