import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

// Базовый URL для сокетов
const SOCKET_URL = 'ws://localhost:3001';

interface UseSocketReturn {
  isConnected: boolean;
  sendPrivateMessage: (to: string, message: string, propertyId?: string) => void;
  socket: Socket | null;
}

const useSocket = (): UseSocketReturn => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    // Инициализация сокета
    const socket = io(SOCKET_URL, {
      auth: {
        userId: user.id
      }
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
  }, [user, isAuthenticated]);

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