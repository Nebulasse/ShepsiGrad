import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

// Базовый URL для сокетов (берем из конфигурации)
const SOCKET_URL = config.apiUrl.replace('/api', '');

interface UseSocketReturn {
  isConnected: boolean;
  sendPrivateMessage: (to: string, message: string, propertyId?: string) => void;
  socket: Socket | null;
}

const useSocket = (): UseSocketReturn => {
  const { user, isAuthenticated, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !isAuthenticated || !token) return;

    // Инициализация сокета
    const socket = io(SOCKET_URL, {
      auth: {
        token,
        appType: 'tenant'
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Обработчики событий
    socket.on('connect', () => {
      console.log('WebSocket подключен');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket отключен');
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Ошибка WebSocket:', error);
    });

    // Очистка при размонтировании
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAuthenticated, token]);

  const sendPrivateMessage = useCallback((to: string, message: string, propertyId?: string) => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('private_message', {
      to,
      message,
      propertyId,
      timestamp: new Date()
    });
  }, [isConnected]);

  return {
    isConnected,
    sendPrivateMessage,
    socket: socketRef.current
  };
};

export { useSocket };
export default useSocket; 