import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { User, UserRole } from '../models/User';
import { AppDataSource } from '../database/connection';

const logger = getModuleLogger('AuthMiddleware');

// Расширяем интерфейс Request для добавления пользователя
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

// Создаем тип для обработчика запросов с аутентификацией
export type AuthHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>;

// Функция для преобразования AuthHandler в стандартный RequestHandler
export const wrapAuthHandler = (handler: AuthHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    return handler(req as AuthenticatedRequest, res, next);
  };
};

/**
 * Middleware для аутентификации пользователя
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Требуется аутентификация');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new ApiError(401, 'Требуется аутентификация');
    }

    try {
      // Верифицируем токен
      const decoded = jwt.verify(token, env.jwt.secret) as { userId: string; role: string };

      // Получаем пользователя из базы данных
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId },
        select: ['id', 'email', 'role', 'firstName', 'lastName', 'isActive']
      });

      if (!user) {
        throw new ApiError(401, 'Пользователь не найден');
      }

      if (!user.isActive) {
        throw new ApiError(403, 'Аккаунт деактивирован');
      }

      // Добавляем пользователя к запросу
      (req as AuthenticatedRequest).user = {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      };

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError(401, 'Невалидный токен');
      } else if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError(401, 'Токен истек');
      } else {
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    logger.error(`Ошибка аутентификации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при аутентификации'
    });
  }
};

/**
 * Middleware для авторизации по ролям
 * @param roles Роли, которые имеют доступ
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      if (!authReq.user) {
        throw new ApiError(401, 'Требуется аутентификация');
      }

      if (!roles.includes(authReq.user.role)) {
        throw new ApiError(403, 'Доступ запрещен');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }

      logger.error(`Ошибка авторизации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка сервера при авторизации'
      });
    }
  };
};

/**
 * Middleware для проверки владельца ресурса
 * @param getResourceOwnerId Функция для получения ID владельца ресурса
 */
export const checkOwnership = (getResourceOwnerId: (req: AuthenticatedRequest) => Promise<string | null>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      if (!authReq.user) {
        return next(new ApiError('Требуется аутентификация', 401));
      }

      // Если пользователь администратор, разрешаем доступ
      if (authReq.user.role === UserRole.ADMIN) {
        return next();
      }

      // Получаем ID владельца ресурса
      const ownerId = await getResourceOwnerId(authReq);

      if (!ownerId) {
        return next(new ApiError('Ресурс не найден', 404));
      }

      // Проверяем, является ли пользователь владельцем ресурса
      if (authReq.user.id !== ownerId) {
        return next(new ApiError('Недостаточно прав для выполнения операции', 403));
      }

      next();
    } catch (error) {
      logger.error(`Ошибка проверки владельца: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      next(new ApiError('Ошибка проверки прав доступа', 500));
    }
  };
}; 