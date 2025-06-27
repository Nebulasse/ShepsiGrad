"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = void 0;
const Review_1 = require("../models/Review");
const Property_1 = require("../models/Property");
/**
 * Контроллер для работы с отзывами
 */
exports.reviewController = {
    /**
     * Создание нового отзыва
     */
    async createReview(req, res) {
        try {
            const { user_id } = req.user;
            const { property_id, booking_id, rating, comment } = req.body;
            // Проверяем существование объекта недвижимости
            const property = await Property_1.PropertyModel.findById(property_id);
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Объект недвижимости не найден',
                });
            }
            // Создаем новый отзыв
            const reviewData = {
                property_id,
                user_id,
                booking_id,
                rating,
                comment,
            };
            const review = await Review_1.ReviewModel.create(reviewData);
            // Обновляем средний рейтинг объекта
            const averageRating = await Review_1.ReviewModel.getAverageRating(property_id);
            res.status(201).json({
                success: true,
                review,
                averageRating,
                message: 'Отзыв успешно создан',
            });
        }
        catch (error) {
            console.error('Error creating review:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при создании отзыва',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Получение отзыва по ID
     */
    async getReviewById(req, res) {
        try {
            const { id } = req.params;
            const review = await Review_1.ReviewModel.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден',
                });
            }
            res.status(200).json({
                success: true,
                review,
            });
        }
        catch (error) {
            console.error('Error fetching review:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении отзыва',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Получение отзывов для объекта недвижимости
     */
    async getPropertyReviews(req, res) {
        try {
            const { property_id } = req.params;
            const { limit, offset, orderBy, orderDirection } = req.query;
            const options = {
                limit: limit ? parseInt(limit, 10) : undefined,
                offset: offset ? parseInt(offset, 10) : undefined,
                orderBy: orderBy,
                orderDirection: orderDirection,
            };
            const { data: reviews, count } = await Review_1.ReviewModel.findByPropertyId(property_id, options);
            const averageRating = await Review_1.ReviewModel.getAverageRating(property_id);
            res.status(200).json({
                success: true,
                reviews,
                count,
                averageRating,
            });
        }
        catch (error) {
            console.error('Error fetching property reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении отзывов',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Получение отзывов пользователя
     */
    async getUserReviews(req, res) {
        try {
            const { user_id } = req.user;
            const reviews = await Review_1.ReviewModel.findByUserId(user_id);
            res.status(200).json({
                success: true,
                reviews,
            });
        }
        catch (error) {
            console.error('Error fetching user reviews:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при получении отзывов пользователя',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Обновление отзыва
     */
    async updateReview(req, res) {
        try {
            const { id } = req.params;
            const { user_id } = req.user;
            const { rating, comment } = req.body;
            // Проверяем существование отзыва
            const review = await Review_1.ReviewModel.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден',
                });
            }
            // Проверяем, принадлежит ли отзыв текущему пользователю
            if (review.user_id !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для редактирования этого отзыва',
                });
            }
            // Обновляем отзыв
            const updatedReview = await Review_1.ReviewModel.update(id, { rating, comment });
            // Обновляем средний рейтинг объекта
            const averageRating = await Review_1.ReviewModel.getAverageRating(review.property_id);
            res.status(200).json({
                success: true,
                review: updatedReview,
                averageRating,
                message: 'Отзыв успешно обновлен',
            });
        }
        catch (error) {
            console.error('Error updating review:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при обновлении отзыва',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Добавление ответа арендодателя на отзыв
     */
    async addLandlordReply(req, res) {
        try {
            const { id } = req.params;
            const { user_id, role } = req.user;
            const { reply } = req.body;
            // Проверяем существование отзыва
            const review = await Review_1.ReviewModel.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден',
                });
            }
            // Проверяем, является ли пользователь владельцем объекта или администратором
            const property = await Property_1.PropertyModel.findById(review.property_id);
            if (!property) {
                return res.status(404).json({
                    success: false,
                    message: 'Объект недвижимости не найден',
                });
            }
            if (property.owner_id !== user_id && role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для добавления ответа на этот отзыв',
                });
            }
            // Добавляем ответ
            const updatedReview = await Review_1.ReviewModel.addLandlordReply(id, reply);
            res.status(200).json({
                success: true,
                review: updatedReview,
                message: 'Ответ успешно добавлен',
            });
        }
        catch (error) {
            console.error('Error adding landlord reply:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при добавлении ответа',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Удаление отзыва
     */
    async deleteReview(req, res) {
        try {
            const { id } = req.params;
            const { user_id, role } = req.user;
            // Проверяем существование отзыва
            const review = await Review_1.ReviewModel.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден',
                });
            }
            // Проверяем права на удаление (владелец отзыва или администратор)
            if (review.user_id !== user_id && role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для удаления этого отзыва',
                });
            }
            // Удаляем отзыв
            await Review_1.ReviewModel.delete(id);
            // Обновляем средний рейтинг объекта
            const averageRating = await Review_1.ReviewModel.getAverageRating(review.property_id);
            res.status(200).json({
                success: true,
                averageRating,
                message: 'Отзыв успешно удален',
            });
        }
        catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при удалении отзыва',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
    /**
     * Модерация отзыва (скрытие/отображение)
     */
    async moderateReview(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.user;
            const { is_hidden } = req.body;
            // Проверяем, является ли пользователь администратором
            if (role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'У вас нет прав для модерации отзывов',
                });
            }
            // Проверяем существование отзыва
            const review = await Review_1.ReviewModel.findById(id);
            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: 'Отзыв не найден',
                });
            }
            // Обновляем статус отзыва
            const updatedReview = await Review_1.ReviewModel.setHidden(id, is_hidden);
            // Обновляем средний рейтинг объекта
            const averageRating = await Review_1.ReviewModel.getAverageRating(review.property_id);
            res.status(200).json({
                success: true,
                review: updatedReview,
                averageRating,
                message: is_hidden ? 'Отзыв скрыт' : 'Отзыв восстановлен',
            });
        }
        catch (error) {
            console.error('Error moderating review:', error);
            res.status(500).json({
                success: false,
                message: 'Ошибка при модерации отзыва',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
        }
    },
};
