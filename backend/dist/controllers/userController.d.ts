import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
/**
 * Контроллер для работы с пользователями
 */
declare const userController: {
    /**
     * Получение профиля текущего пользователя
     */
    getProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Обновление профиля текущего пользователя
     */
    updateProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Удаление профиля текущего пользователя
     */
    deleteProfile: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Получение списка всех пользователей (только для админа)
     */
    getAllUsers: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateUserRole(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
export default userController;
