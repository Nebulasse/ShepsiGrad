import { Request, Response } from 'express';
import { AppDataSource } from '../database/connection';
import { Review } from '../models/Review';
import { Property } from '../models/Property';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest, wrapAuthHandler } from '../middleware/auth.middleware';

const logger = getModuleLogger('ReviewController');

class ReviewController {
  /**
   * Получение всех отзывов
   */
  getAllReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const reviewRepository = AppDataSource.getRepository(Review);
      
      const [reviews, total] = await reviewRepository.findAndCount({
        relations: ['user', 'property'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Ошибка при получении отзывов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзывов'
      });
    }
  };

  /**
   * Получение отзывов для конкретного объекта недвижимости
   */
  getPropertyReviews = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { propertyId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const reviewRepository = AppDataSource.getRepository(Review);
      const propertyRepository = AppDataSource.getRepository(Property);

      // Проверяем существование объекта недвижимости
      const property = await propertyRepository.findOne({ where: { id: propertyId } });
      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Получаем отзывы для объекта недвижимости
      const [reviews, total] = await reviewRepository.findAndCount({
        where: { propertyId },
        relations: ['user'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Ошибка при получении отзывов для объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзывов'
      });
    }
  };

  /**
   * Получение отзыва по ID
   */
  getReviewById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      
      const reviewRepository = AppDataSource.getRepository(Review);
      const review = await reviewRepository.findOne({
        where: { id },
        relations: ['user', 'property']
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      return res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      logger.error(`Ошибка при получении отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении отзыва'
      });
    }
  };

  /**
   * Создание нового отзыва
   */
  createReview = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { propertyId, rating, comment, cleanliness, communication, checkIn, accuracy, location, value, bookingId, images } = req.body;
      
      // Проверяем существование объекта недвижимости
      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id: propertyId },
        relations: ['owner']
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь не оставляет отзыв на свой объект
      if (property.ownerId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Вы не можете оставить отзыв на свой собственный объект'
        });
      }

      // Проверяем, что пользователь не оставил уже отзыв на этот объект
      const reviewRepository = AppDataSource.getRepository(Review);
      const existingReview = await reviewRepository.findOne({
        where: {
          userId: req.user.id,
          propertyId
        }
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Вы уже оставили отзыв на этот объект'
        });
      }

      // Если указан ID бронирования, проверяем его
      let booking = null;
      if (bookingId) {
        const bookingRepository = AppDataSource.getRepository(Booking);
        booking = await bookingRepository.findOne({
          where: {
            id: bookingId,
            userId: req.user.id,
            propertyId
          }
        });

        if (!booking) {
          return res.status(404).json({
            success: false,
            message: 'Бронирование не найдено или не принадлежит вам'
          });
        }
      }

      // Создаем новый отзыв
      const newReview = reviewRepository.create({
        userId: req.user.id,
        propertyId,
        bookingId: booking?.id,
        rating,
        comment,
        cleanliness,
        communication,
        checkIn,
        accuracy,
        location,
        value,
        images,
        isApproved: false,
        isHidden: false
      });

      await reviewRepository.save(newReview);

      // Обновляем средний рейтинг объекта недвижимости
      await this.updatePropertyRating(propertyId);

      return res.status(201).json({
        success: true,
        message: 'Отзыв успешно создан',
        data: newReview
      });
    } catch (error) {
      logger.error(`Ошибка при создании отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при создании отзыва'
      });
    }
  });

  /**
   * Обновление отзыва
   */
  updateReview = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { rating, comment, cleanliness, communication, checkIn, accuracy, location, value, images } = req.body;

      const reviewRepository = AppDataSource.getRepository(Review);
      const review = await reviewRepository.findOne({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Проверяем, что пользователь является автором отзыва
      if (review.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на редактирование этого отзыва'
        });
      }

      // Обновляем отзыв
      review.rating = rating || review.rating;
      review.comment = comment || review.comment;
      review.cleanliness = cleanliness !== undefined ? cleanliness : review.cleanliness;
      review.communication = communication !== undefined ? communication : review.communication;
      review.checkIn = checkIn !== undefined ? checkIn : review.checkIn;
      review.accuracy = accuracy !== undefined ? accuracy : review.accuracy;
      review.location = location !== undefined ? location : review.location;
      review.value = value !== undefined ? value : review.value;
      review.images = images || review.images;
      review.updatedAt = new Date();

      await reviewRepository.save(review);

      // Обновляем средний рейтинг объекта недвижимости
      await this.updatePropertyRating(review.propertyId);

      return res.status(200).json({
        success: true,
        message: 'Отзыв успешно обновлен',
        data: review
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении отзыва'
      });
    }
  });

  /**
   * Удаление отзыва
   */
  deleteReview = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const reviewRepository = AppDataSource.getRepository(Review);
      const review = await reviewRepository.findOne({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Проверяем, что пользователь является автором отзыва или администратором
      if (review.userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на удаление этого отзыва'
        });
      }

      const propertyId = review.propertyId;

      await reviewRepository.remove(review);

      // Обновляем средний рейтинг объекта недвижимости
      await this.updatePropertyRating(propertyId);

      return res.status(200).json({
        success: true,
        message: 'Отзыв успешно удален'
      });
    } catch (error) {
      logger.error(`Ошибка при удалении отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при удалении отзыва'
      });
    }
  });

  /**
   * Добавление ответа владельца на отзыв
   */
  addLandlordReply = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { reply } = req.body;

      const reviewRepository = AppDataSource.getRepository(Review);
      const propertyRepository = AppDataSource.getRepository(Property);

      const review = await reviewRepository.findOne({
        where: { id },
        relations: ['property']
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта недвижимости
      const property = await propertyRepository.findOne({
        where: { id: review.propertyId }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на добавление ответа к этому отзыву'
        });
      }

      // Добавляем ответ
      review.ownerReply = reply;
      review.ownerReplyDate = new Date();
      review.updatedAt = new Date();

      await reviewRepository.save(review);

      return res.status(200).json({
        success: true,
        message: 'Ответ успешно добавлен',
        data: review
      });
    } catch (error) {
      logger.error(`Ошибка при добавлении ответа на отзыв: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при добавлении ответа на отзыв'
      });
    }
  });

  /**
   * Модерация отзыва (для администратора)
   */
  moderateReview = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { isApproved, isHidden, adminComment } = req.body;

      // Проверяем, что пользователь является администратором
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на модерацию отзывов'
        });
      }

      const reviewRepository = AppDataSource.getRepository(Review);
      const review = await reviewRepository.findOne({
        where: { id }
      });

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Отзыв не найден'
        });
      }

      // Обновляем статус модерации
      if (isApproved !== undefined) review.isApproved = isApproved;
      if (isHidden !== undefined) review.isHidden = isHidden;
      if (adminComment !== undefined) review.adminComment = adminComment;
      review.updatedAt = new Date();

      await reviewRepository.save(review);

      // Если отзыв скрыт или не одобрен, обновляем средний рейтинг объекта недвижимости
      if (isHidden === true || isApproved === false) {
        await this.updatePropertyRating(review.propertyId);
      }

      return res.status(200).json({
        success: true,
        message: 'Отзыв успешно модерирован',
        data: review
      });
    } catch (error) {
      logger.error(`Ошибка при модерации отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при модерации отзыва'
      });
    }
  });

  /**
   * Обновление среднего рейтинга объекта недвижимости
   */
  private async updatePropertyRating(propertyId: string): Promise<void> {
    try {
      const reviewRepository = AppDataSource.getRepository(Review);
      const propertyRepository = AppDataSource.getRepository(Property);

      // Получаем все одобренные и не скрытые отзывы для объекта
      const reviews = await reviewRepository.find({
        where: {
          propertyId,
          isApproved: true,
          isHidden: false
        }
      });

      // Если отзывов нет, устанавливаем рейтинг в 0
      if (reviews.length === 0) {
        return;
      }

      // Вычисляем средний рейтинг
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;

      // Обновляем объект недвижимости
      await propertyRepository.update(propertyId, {
        averageRating,
        reviewCount: reviews.length
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении рейтинга объекта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }
}

export default new ReviewController(); 