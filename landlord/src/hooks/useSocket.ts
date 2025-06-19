import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface UseSocketReturn {
  isConnected: boolean;
  sendPrivateMessage: (to: string, message: string) => void;
  sendNotification: (userId: string, notification: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    // Инициализация сокета
    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      auth: {
        token
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
  }, [user, token]);

  const sendPrivateMessage = useCallback((to: string, message: string) => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('private_message', {
      to,
      message,
      timestamp: new Date()
    });
  }, [isConnected]);

  const sendNotification = useCallback((userId: string, notification: any) => {
    if (!socketRef.current || !isConnected) return;

    socketRef.current.emit('notification', {
      userId,
      notification: {
        ...notification,
        timestamp: new Date()
      }
    });
  }, [isConnected]);

  return {
    isConnected,
    sendPrivateMessage,
    sendNotification
  };
}; 