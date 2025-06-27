import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
export interface AuthenticatedRequest extends Request {
    user: User;
}
/**
 * Middleware для проверки аутентификации
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * Middleware для проверки авторизации по ролям
 * @param roles Массив разрешенных ролей
 */
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
declare const _default: {
    authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
};
export default _default;
