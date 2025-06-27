import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { AnyZodObject, ZodError } from 'zod';
import { Schema } from 'joi';

const logger = getModuleLogger('ValidationMiddleware');

/**
 * Middleware для валидации запросов с использованием Joi
 * @param schema Схема валидации Joi
 */
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorDetails = error.details.map(detail => ({
          message: detail.message,
          path: detail.path.join('.')
        }));

        logger.warn(`Ошибка валидации: ${JSON.stringify(errorDetails)}`);
        
        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации',
          errors: errorDetails
        });
      }

      next();
    } catch (error) {
      logger.error(`Ошибка валидации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return next(error);
    }
  };
};

/**
 * Middleware для валидации параметров запроса
 * @param schema Объект с правилами валидации для параметров
 */
export const validateParams = (schema: Record<string, (value: any) => boolean | string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    // Проверяем каждый параметр по схеме
    Object.entries(schema).forEach(([param, validator]) => {
      const value = req.params[param];
      const result = validator(value);

      if (typeof result === 'string') {
        errors.push({
          field: param,
          message: result
        });
      }
    });

    // Если ошибок нет, передаем управление следующему middleware
    if (errors.length === 0) {
      return next();
    }

    logger.warn(`Ошибка валидации параметров: ${JSON.stringify(errors)}`);

    // Создаем ошибку валидации и передаем ее обработчику ошибок
    const error = new ApiError('Ошибка валидации параметров', 422, true, errors);
    return next(error);
  };
};

/**
 * Middleware для валидации query-параметров запроса
 * @param schema Объект с правилами валидации для query-параметров
 */
export const validateQuery = (schema: Record<string, (value: any) => boolean | string>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];

    // Проверяем каждый query-параметр по схеме
    Object.entries(schema).forEach(([param, validator]) => {
      if (req.query[param] !== undefined) {
        const value = req.query[param];
        const result = validator(value);

        if (typeof result === 'string') {
          errors.push({
            field: param,
            message: result
          });
        }
      }
    });

    // Если ошибок нет, передаем управление следующему middleware
    if (errors.length === 0) {
      return next();
    }

    logger.warn(`Ошибка валидации query-параметров: ${JSON.stringify(errors)}`);

    // Создаем ошибку валидации и передаем ее обработчику ошибок
    const error = new ApiError('Ошибка валидации query-параметров', 422, true, errors);
    return next(error);
  };
};

/**
 * Middleware для валидации запросов с использованием схем Zod
 * @param schema Схема валидации Zod
 */
export const validateZod = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Валидируем запрос по схеме
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      
      next();
    } catch (error) {
      logger.error(`Ошибка валидации Zod: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      if (error instanceof ZodError) {
        // Форматируем ошибки валидации
        const formattedErrors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Ошибка валидации',
          errors: formattedErrors
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Ошибка валидации запроса'
      });
    }
  };
}; 