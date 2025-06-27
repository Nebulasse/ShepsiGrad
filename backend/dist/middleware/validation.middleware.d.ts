import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationChain } from 'express-validator';
/**
 * Middleware для валидации тела запроса
 * @param schema Joi схема для валидации
 */
export declare const validateBody: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware для валидации параметров запроса
 * @param schema Joi схема для валидации
 */
export declare const validateParams: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware для валидации query-параметров запроса
 * @param schema Joi схема для валидации
 */
export declare const validateQuery: (schema: Schema) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware для валидации запросов с помощью express-validator
 * @param validations Массив валидаторов
 * @returns Middleware функция
 */
export declare const validateRequest: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export default validateRequest;
