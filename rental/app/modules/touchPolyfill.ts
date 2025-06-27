/**
 * Полифилл для исправления ошибок с touch событиями
 * 
 * Этот файл исправляет ошибку "Cannot record touch end without a touch start"
 * в веб-версии приложения
 */

import { Platform } from 'react-native';

// Исправляем ошибку только для веб-платформы
if (Platform.OS === 'web') {
  // Проверяем, запущено ли приложение в браузере
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Сохраняем оригинальные методы
    const originalAddEventListener = document.addEventListener;
    const originalRemoveEventListener = document.removeEventListener;
    
    // Патчим addEventListener для обработки touch событий
    document.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      // Если это touch событие, добавляем дополнительную обработку
      if (type === 'touchend') {
        const wrappedListener = function(event: Event) {
          // Проверяем, было ли touchstart событие
          if ((event as TouchEvent).touches.length === 0 && (event as TouchEvent).changedTouches.length > 0) {
            // Если нет активных касаний, но есть измененные касания,
            // значит это валидное touchend событие
            if (typeof listener === 'function') {
              listener(event);
            } else if (listener && typeof listener.handleEvent === 'function') {
              listener.handleEvent(event);
            }
          }
          return;
        };
        
        // Вызываем оригинальный метод с нашим обработчиком
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      
      // Для всех остальных событий используем оригинальный метод
      return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Патчим removeEventListener для совместимости
    document.removeEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
      // Вызываем оригинальный метод
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    
    console.log('Touch events polyfill установлен');
  }
} 