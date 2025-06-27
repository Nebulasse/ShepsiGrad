/**
 * WebSocket Polyfill для Hermes engine
 * 
 * Этот файл добавляет глобальную переменную WebSocket для Hermes engine,
 * который не имеет встроенной поддержки WebSocket.
 */

import * as WebSocketModule from 'react-native-websocket';

// Проверяем, существует ли глобальный объект WebSocket
if (typeof global.WebSocket === 'undefined') {
  // Используем импортированный модуль вместо require
  const websocketPolyfill = WebSocketModule.default;
  
  // Устанавливаем WebSocket как глобальный объект
  global.WebSocket = websocketPolyfill;
} 