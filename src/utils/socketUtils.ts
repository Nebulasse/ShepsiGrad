import { Socket } from 'socket.io';
import { verifyToken } from './jwtUtils';
import { AuthenticatedSocket, SocketEventType } from '../types/socket';
import { getModuleLogger } from './logger';

const logger = getModuleLogger('SocketUtils');

/**
 * Аутентифицирует сокет на основе JWT токена
 * @param socket Сокет для аутентификации
 * @param token JWT токен
 * @returns true если аутентификация успешна, иначе false
 */
export const authenticateSocket = (socket: Socket, token: string): boolean => {
  try {
    const payload = verifyToken(token);
    
    if (!payload) {
      logger.warn('Неверный токен для аутентификации сокета');
      return false;
    }
    
    const authSocket = socket as AuthenticatedSocket;
    authSocket.userId = payload.userId;
    authSocket.userRole = payload.role;
    authSocket.isAuthenticated = true;
    
    logger.info(`Сокет аутентифицирован для пользователя ${payload.userId}`);
    return true;
  } catch (error) {
    logger.error(`Ошибка аутентификации сокета: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    return false;
  }
};

/**
 * Проверяет, аутентифицирован ли сокет
 * @param socket Сокет для проверки
 * @returns true если сокет аутентифицирован, иначе false
 */
export const isSocketAuthenticated = (socket: Socket): boolean => {
  const authSocket = socket as AuthenticatedSocket;
  return !!authSocket.isAuthenticated;
};

/**
 * Получает ID пользователя из сокета
 * @param socket Сокет
 * @returns ID пользователя или undefined
 */
export const getUserIdFromSocket = (socket: Socket): string | undefined => {
  const authSocket = socket as AuthenticatedSocket;
  return authSocket.userId;
};

/**
 * Получает роль пользователя из сокета
 * @param socket Сокет
 * @returns Роль пользователя или undefined
 */
export const getUserRoleFromSocket = (socket: Socket): string | undefined => {
  const authSocket = socket as AuthenticatedSocket;
  return authSocket.userRole;
};

/**
 * Валидирует событие WebSocket
 * @param event Событие для валидации
 * @returns true если событие валидно, иначе false
 */
export const validateSocketEvent = (event: any): event is SocketEventType => {
  if (!event || typeof event !== 'object') {
    return false;
  }
  
  if (!event.type || typeof event.type !== 'string') {
    return false;
  }
  
  if (!event.timestamp || typeof event.timestamp !== 'number') {
    return false;
  }
  
  return true;
};

/**
 * Создает новое событие WebSocket
 * @param type Тип события
 * @param data Данные события
 * @returns Событие WebSocket
 */
export const createSocketEvent = <T extends SocketEventType>(type: T['type'], data: Omit<T, 'type' | 'timestamp'>): T => {
  return {
    type,
    timestamp: Date.now(),
    ...data
  } as T;
}; 