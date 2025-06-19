import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { TokenPayload } from '../services/auth.service';
import User, { UserRole, UserStatus } from '../models/user.model';
import { getModuleLogger } from '../utils/logger';

const logger = getModuleLogger('AuthMiddleware');

// Расширение интерфейса Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: number;
      userRole?: string;
    }
  }
}

// Расширение типа Request для включения пользовательских данных
export interface AuthenticatedRequest extends Request {
    user: {
        user_id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
        [key: string]: any;
    };
}

/**
 * Middleware для проверки аутентификации пользователя
 * Проверяет наличие и валидность JWT токена
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Требуется аутентификация' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Проверяем токен
    const payload = jwt.verify(token, env.jwt.secret) as TokenPayload;

    // Получаем пользователя
    const user = await User.findByPk(payload.userId);
    if (!user) {
      res.status(401).json({ message: 'Пользователь не найден' });
      return;
    }

    // Проверяем статус пользователя
    if (user.status !== UserStatus.ACTIVE) {
      res.status(403).json({ message: 'Пользователь не активен' });
      return;
    }

    // Добавляем пользователя в объект запроса
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    logger.error(`Ошибка аутентификации: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Токен истек', expired: true });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Неверный токен' });
    } else {
      res.status(500).json({ message: 'Ошибка сервера при аутентификации' });
    }
  }
};

/**
 * Middleware для проверки роли пользователя
 * @param roles Разрешенные роли
 */
export const authorize = (roles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Проверяем, что пользователь прошел аутентификацию
    if (!req.user) {
      res.status(401).json({ message: 'Требуется аутентификация' });
      return;
    }

    // Проверяем роль пользователя
    if (!roles.includes(req.user.role as UserRole)) {
      logger.warn(`Доступ запрещен для пользователя ${req.user.id} с ролью ${req.user.role}`);
      res.status(403).json({ message: 'Доступ запрещен' });
      return;
    }

    next();
  };
};

/**
 * Middleware для проверки владельца ресурса
 * @param getResourceUserId Функция для получения ID владельца ресурса из запроса
 */
export const authorizeOwner = (
  getResourceUserId: (req: Request) => Promise<number> | number
): (req: Request, res: Response, next: NextFunction) => Promise<void> => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Проверяем, что пользователь прошел аутентификацию
      if (!req.user) {
        res.status(401).json({ message: 'Требуется аутентификация' });
        return;
      }

      // Администраторы могут доступиться к любому ресурсу
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Получаем ID владельца ресурса
      const resourceUserId = await getResourceUserId(req);

      // Проверяем, что пользователь является владельцем ресурса
      if (req.user.id !== resourceUserId) {
        logger.warn(`Доступ запрещен: пользователь ${req.user.id} пытается получить доступ к ресурсу пользователя ${resourceUserId}`);
        res.status(403).json({ message: 'Доступ запрещен' });
        return;
      }

      next();
    } catch (error) {
      logger.error(`Ошибка при проверке владельца ресурса: ${error.message}`);
      res.status(500).json({ message: 'Ошибка сервера при проверке доступа' });
    }
  };
};

// Экспортируем тип для использования в других файлах
export default AuthenticatedRequest; 