import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'express-validator';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

const logger = getModuleLogger('ErrorHandler');

/**
 * Middleware для обработки 404 ошибок
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Не найден путь: ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Middleware для обработки ошибок
 */
export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  // Определяем статус ошибки
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  
  // Определяем тип ответа
  const isApiError = err instanceof ApiError;
  
  // Логируем ошибку
  if (statusCode >= 500) {
    logger.error(`Ошибка сервера: ${err.message}`, { 
      path: req.path,
      method: req.method,
      stack: err.stack,
      body: req.body
    });
  } else {
    logger.warn(`Ошибка клиента: ${err.message}`, { 
      path: req.path,
      method: req.method
    });
  }

  // Формируем ответ
  const response = {
    success: false,
    message: statusCode >= 500 && !isApiError ? 'Внутренняя ошибка сервера' : err.message,
    ...(isApiError && (err as ApiError).isOperational && {
      errors: (err as ApiError).errors
    }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  };

  // Отправляем ответ
  res.status(statusCode).json(response);
};

// Обработчик ошибок валидации
export const validationErrorHandler = (req: Request, res: Response, next: NextFunction, errors: ValidationError[]) => {
  if (errors.length > 0) {
    const validationErrors = errors.map(error => ({
      field: error.param,
      message: error.msg
    }));
    
    const error = new ApiError('Ошибка валидации', 422, true, validationErrors);
    return next(error);
  }
  
  next();
};

/**
 * Настройка обработчика неперехваченных исключений
 */
export const setupUncaughtExceptionHandler = () => {
  // Обработка неперехваченных исключений
  process.on('uncaughtException', (error: Error) => {
    logger.error(`Неперехваченное исключение: ${error.message}`, { stack: error.stack });
    
    // Завершаем процесс с ошибкой
    process.exit(1);
  });

  // Обработка необработанных отклонений промисов
  process.on('unhandledRejection', (reason: Error | any) => {
    logger.error(`Необработанное отклонение промиса: ${reason instanceof Error ? reason.message : 'Неизвестная ошибка'}`, {
      stack: reason instanceof Error ? reason.stack : undefined
    });
    
    // В production окружении завершаем процесс
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  });
}; 