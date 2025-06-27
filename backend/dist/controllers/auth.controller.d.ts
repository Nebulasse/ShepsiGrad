import { Request, Response } from 'express';
/**
 * Контроллер для обработки запросов аутентификации
 */
declare class AuthController {
    /**
     * Регистрация нового пользователя
     * @route POST /api/auth/register
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Вход пользователя
     * @route POST /api/auth/login
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * Обновление токена доступа
     * @route POST /api/auth/refresh-token
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Подтверждение email пользователя
     * @route GET /api/auth/verify-email/:token
     */
    verifyEmail(req: Request, res: Response): Promise<void>;
    /**
     * Запрос на сброс пароля
     * @route POST /api/auth/forgot-password
     */
    forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * Сброс пароля
     * @route POST /api/auth/reset-password
     */
    resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Получение текущего пользователя
     * @route GET /api/auth/me
     */
    getCurrentUser(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
export {};
