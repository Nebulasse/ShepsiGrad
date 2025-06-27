import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';
import { getModuleLogger } from './logger';

const logger = getModuleLogger('ErrorHandler');

/**
 * Функция обертка для обработки ошибок в асинхронных middleware
 * @param fn Асинхронная функция middleware
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
};

/**
 * Middleware для обработки ошибок
 */
export const errorMiddleware = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  // Если ошибка уже является ApiError, используем её
  if (err instanceof ApiError) {
    logger.error(`API Error: ${err.message}`, { statusCode: err.statusCode, path: req.path });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
  }

  // Если ошибка является экземпляром Error
  if (err instanceof Error) {
    logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, path: req.path });
    return res.status(500).json({
      success: false,
      message: 'Внутренняя ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Если ошибка неизвестного типа
  logger.error('Unknown Error', { error: String(err), path: req.path });
  return res.status(500).json({
    success: false,
    message: 'Внутренняя ошибка сервера'
  });
};

/**
 * Middleware для обработки 404 ошибок
 */
export const notFoundMiddleware = (req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.path}`);
  return res.status(404).json({
    success: false,
    message: 'Запрашиваемый ресурс не найден'
  });
}; 