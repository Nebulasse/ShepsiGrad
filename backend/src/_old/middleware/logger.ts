import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/loggerService';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Логируем запрос
    LoggerService.info(`Incoming ${req.method} request to ${req.originalUrl}`, {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query,
        user: (req as any).user,
    });

    // Перехватываем ответ
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        LoggerService.logHttpRequest(req, res, responseTime);
    });

    next();
};

export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
    LoggerService.logError(err, req);
    next(err);
}; 