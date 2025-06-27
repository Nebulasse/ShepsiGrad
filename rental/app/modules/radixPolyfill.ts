/**
 * Полифилл для @radix-ui/react-slot
 * 
 * Этот файл создает полифилл для модулей @radix-ui,
 * которые могут вызывать проблемы в Expo
 */

import { Slot } from './customSlot';

// Создаем фиктивный модуль для @radix-ui/react-slot
if (typeof global.__RADIX_UI_MODULES__ === 'undefined') {
  global.__RADIX_UI_MODULES__ = {};
  
  // Сохраняем наш Slot компонент в глобальном объекте
  global.__RADIX_UI_MODULES__.Slot = Slot;
  
  // Проверяем существование global.require перед его использованием
  if (typeof global.require !== 'undefined') {
    // Патчим require для перехвата запросов к @radix-ui/react-slot
    const originalRequire = global.require;
    global.require = function(moduleName: string) {
      if (moduleName === '@radix-ui/react-slot') {
        // Возвращаем наш фиктивный модуль
        return {
          Slot: global.__RADIX_UI_MODULES__.Slot
        };
      }
      // Для всех остальных модулей используем оригинальный require
      return originalRequire(moduleName);
    };
  }
}

// Экспортируем Slot для удобства использования
export { Slot }; 