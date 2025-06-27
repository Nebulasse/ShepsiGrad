import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateZod } from '../middleware/validation.middleware';
import reviewController from '../controllers/reviewController';
import * as reviewSchema from '../schemas/review.schema';
import { createTypedRouter } from '../utils/routeUtils';

// Создаем типизированный маршрутизатор
const typedRouter = createTypedRouter();

// Получение всех отзывов (доступно всем)
typedRouter.get('/', reviewController.getAllReviews);

// Получение отзывов для конкретного объекта недвижимости
typedRouter.get('/property/:propertyId', reviewController.getPropertyReviews);

// Получение отзыва по ID
typedRouter.get('/:id', reviewController.getReviewById);

// Создание нового отзыва (требуется аутентификация)
typedRouter.postAuth('/', reviewController.createReview, authenticate, validateZod(reviewSchema.createReview));

// Обновление отзыва (только автор)
typedRouter.putAuth('/:id', reviewController.updateReview, authenticate, validateZod(reviewSchema.updateReview));

// Удаление отзыва (автор или администратор)
typedRouter.deleteAuth('/:id', reviewController.deleteReview, authenticate);

// Добавление ответа владельца на отзыв (только владелец объекта или администратор)
typedRouter.postAuth('/:id/reply', reviewController.addLandlordReply, authenticate, validateZod(reviewSchema.replyReview));

// Модерация отзыва (только администратор)
typedRouter.putAuth('/:id/moderate', reviewController.moderateReview, authenticate, authorize('admin'), validateZod(reviewSchema.moderateReview));

// Экспортируем маршрутизатор
export default typedRouter.getRouter(); 