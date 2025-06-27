/**
 * Socket.IO Polyfill для Hermes engine
 * 
 * Этот файл добавляет поддержку Socket.IO для Hermes engine,
 * который может иметь проблемы с некоторыми функциями.
 */

import { io as socketIo } from 'socket.io-client';

// Экспортируем функцию для создания сокета без использования require
export const createSocketConnection = (url: string, options: any = {}) => {
  return socketIo(url, {
    transports: ['websocket'],
    ...options
  });
};

// Экспортируем Socket.IO клиент
export { socketIo }; 