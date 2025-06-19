import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface UseSocketReturn {
  sendPrivateMessage: (to: string, message: string) => void;
  sendNotification: (to: string, type: string, content: any) => void;
  isConnected: boolean;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Создаем подключение к WebSocket
    socketRef.current = io(process.env.REACT_APP_WS_URL || 'http://localhost:3001', {
      auth: { token }
    });

    // Обработчики событий
    socketRef.current.on('connect', () => {
      console.log('WebSocket подключен');
      setIsConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('WebSocket отключен');
      setIsConnected(false);
    });

    socketRef.current.on('private_message', (data) => {
      console.log('Получено личное сообщение:', data);
      // Здесь можно добавить обработку входящих сообщений
    });

    socketRef.current.on('notification', (data) => {
      console.log('Получено уведомление:', data);
      // Здесь можно добавить обработку уведомлений
    });

    socketRef.current.on('broadcast_message', (data) => {
      console.log('Получено широковещательное сообщение:', data);
      // Здесь можно добавить обработку широковещательных сообщений
    });

    // Очистка при размонтировании
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user]);

  // Функция для отправки личного сообщения
  const sendPrivateMessage = useCallback((to: string, message: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('private_message', { to, message });
    }
  }, [isConnected]);

  // Функция для отправки уведомления
  const sendNotification = useCallback((to: string, type: string, content: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('notification', { to, type, content });
    }
  }, [isConnected]);

  return {
    sendPrivateMessage,
    sendNotification,
    isConnected
  };
}; 