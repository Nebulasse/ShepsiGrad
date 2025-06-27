import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { getModuleLogger } from '../utils/logger';
import { validationResult, ValidationChain } from 'express-validator';

const logger = getModuleLogger('ValidationMiddleware');

/**
 * Middleware для валидации тела запроса
 * @param schema Joi схема для валидации
 */
export const validateBody = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Ошибка валидации тела запроса: ${errorMessage}`);
      
      res.status(400).json({
        message: 'Ошибка валидации',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }

    // Заменяем тело запроса валидированными данными
    req.body = value;
    next();
  };
};

/**
 * Middleware для валидации параметров запроса
 * @param schema Joi схема для валидации
 */
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Ошибка валидации параметров запроса: ${errorMessage}`);
      
      res.status(400).json({
        message: 'Ошибка валидации',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }

    // Заменяем параметры запроса валидированными данными
    req.params = value;
    next();
  };
};

/**
 * Middleware для валидации query-параметров запроса
 * @param schema Joi схема для валидации
 */
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Ошибка валидации query-параметров запроса: ${errorMessage}`);
      
      res.status(400).json({
        message: 'Ошибка валидации',
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }

    // Заменяем query-параметры запроса валидированными данными
    req.query = value;
    next();
  };
};

/**
 * Middleware для валидации запросов с помощью express-validator
 * @param validations Массив валидаторов
 * @returns Middleware функция
 */
export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Выполняем все валидаторы
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    // Собираем ошибки валидации
    const errors = validationResult(req);
    
    // Если ошибок нет, продолжаем выполнение запроса
    if (errors.isEmpty()) {
      return next();
    }

    // Логируем ошибки валидации
    logger.debug(`Validation errors: ${JSON.stringify(errors.array())}`);

    // Возвращаем ошибки клиенту
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: errors.array(),
    });
  };
};

export default validateRequest; 