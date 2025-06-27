import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';
import { createSocketConnection } from '../modules/socketIoPolyfill';
import type { Socket } from 'socket.io-client';

/**
 * Хук для работы с WebSocket соединением
 * @returns {Socket | null} Сокет-соединение или null, если соединение не установлено
 */
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Функция для инициализации сокета
    const initializeSocket = async () => {
      try {
        // Получаем токен авторизации
        const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
        
        if (!token) {
          console.log('Токен не найден, WebSocket соединение не будет установлено');
          return;
        }
        
        // Создаем сокет-соединение используя наш полифилл
        const socketInstance = createSocketConnection(`${API_CONFIG.baseUrl}`, {
          auth: {
            token,
            appType: 'landlord'
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
        
        // Настраиваем обработчики событий
        socketInstance.on('connect', () => {
          console.log('WebSocket соединение установлено');
        });
        
        socketInstance.on('disconnect', (reason) => {
          console.log('WebSocket соединение разорвано:', reason);
        });
        
        socketInstance.on('connect_error', (error) => {
          console.error('Ошибка WebSocket соединения:', error);
        });
        
        // Сохраняем экземпляр сокета
        if (isMounted) {
          setSocket(socketInstance);
        }
      } catch (error) {
        console.error('Ошибка при инициализации WebSocket:', error);
      }
    };
    
    // Инициализируем сокет
    initializeSocket();
    
    // Очистка при размонтировании
    return () => {
      isMounted = false;
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    };
  }, []);
  
  return { socket };
};

/**
 * Хук для подписки на определенные события WebSocket
 * @param {string} eventName - Имя события
 * @param {Function} callback - Функция обратного вызова
 */
export const useSocketEvent = (eventName: string, callback: (data: any) => void) => {
  const { socket } = useSocket();
  
  useEffect(() => {
    if (!socket) return;
    
    // Подписываемся на событие
    socket.on(eventName, callback);
    
    // Отписываемся при размонтировании
    return () => {
      socket.off(eventName, callback);
    };
  }, [socket, eventName, callback]);
  
  return socket;
}; 