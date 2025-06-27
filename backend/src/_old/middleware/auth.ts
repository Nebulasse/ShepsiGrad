import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { LoggerService } from '../services/loggerService';
import { env } from '../config/env';

// Расширяем интерфейс Request для типизации
export interface AuthRequest extends Request {
    user?: any;
}

// Аутентификация пользователя
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, env.jwt.secret);
        const user = await User.findOne({ _id: (decoded as any)._id });

        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        LoggerService.error('Authentication error', { error });
        res.status(401).json({ error: 'Пожалуйста, авторизуйтесь' });
    }
};

// Проверка роли пользователя
export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: 'Access denied',
                message: `Required role: ${roles.join(' or ')}`
            });
        }

        next();
    };
};

export const auth = authenticate; // Для обратной совместимости

export const generateToken = (userId: string): string => {
    return jwt.sign({ _id: userId }, env.jwt.secret, {
        expiresIn: '7d'
    });
};

// Middleware для проверки роли пользователя (для обратной совместимости)
export const checkRole = (roles: string[]) => {
    return authorize(...roles);
}; 