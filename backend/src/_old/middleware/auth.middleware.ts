import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';
import { User } from '../models/User';

const logger = getModuleLogger('AuthMiddleware');

// Интерфейс для аутентифицированного запроса
export interface AuthenticatedRequest extends Request {
  user: User;
}

/**
 * Middleware для проверки аутентификации
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Получаем токен из заголовка
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Отсутствует токен авторизации',
      });
    }

    const token = authHeader.split(' ')[1];

    // Проверяем токен
    const decoded = jwt.verify(token, env.jwt.secret) as jwt.JwtPayload;
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Недействительный токен',
      });
    }

    // Находим пользователя в базе данных
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Пользователь не найден',
      });
    }

    // Добавляем пользователя к запросу
    (req as AuthenticatedRequest).user = user;

    next();
  } catch (error) {
    logger.error(`Ошибка аутентификации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    return res.status(401).json({
      status: 'error',
      message: 'Ошибка аутентификации',
    });
  }
};

/**
 * Middleware для проверки авторизации по ролям
 * @param roles Массив разрешенных ролей
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    
    if (!authReq.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Требуется аутентификация',
      });
    }

    if (!roles.includes(authReq.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Доступ запрещен. Требуемые роли: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

export default { authenticate, authorize }; 