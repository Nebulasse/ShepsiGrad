import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
/**
 * Контроллер для работы с отзывами
 */
export declare const reviewController: {
    /**
     * Создание нового отзыва
     */
    createReview(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получение отзыва по ID
     */
    getReviewById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Получение отзывов для объекта недвижимости
     */
    getPropertyReviews(req: Request, res: Response): Promise<void>;
    /**
     * Получение отзывов пользователя
     */
    getUserReviews(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Обновление отзыва
     */
    updateReview(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Добавление ответа арендодателя на отзыв
     */
    addLandlordReply(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Удаление отзыва
     */
    deleteReview(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Модерация отзыва (скрытие/отображение)
     */
    moderateReview(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
