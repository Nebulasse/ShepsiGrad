import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';
import { LoggerService } from '../services/loggerService';

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Логируем ошибку
    LoggerService.logError(err, req);

    if (err instanceof ValidationError) {
        return res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Обработка ошибок Supabase
    if (err.name === 'PostgrestError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Database error'
        });
    }

    // Неизвестные ошибки
    return res.status(500).json({
        status: 'error',
        message: 'Something went wrong'
    });
};

export const notFoundHandler = (req: Request, res: Response) => {
    LoggerService.warn(`Route not found: ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });

    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
}; 