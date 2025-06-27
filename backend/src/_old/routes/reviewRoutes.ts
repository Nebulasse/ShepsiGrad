import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { reviewSchema } from '../schemas/validationSchemas';

const router = Router();

// Маршруты для работы с отзывами
router.post('/', authenticate, validateRequest(reviewSchema.createReview), reviewController.createReview);
router.get('/:id', reviewController.getReviewById);
router.get('/property/:property_id', reviewController.getPropertyReviews);
router.get('/user/reviews', authenticate, reviewController.getUserReviews);
router.put('/:id', authenticate, validateRequest(reviewSchema.updateReview), reviewController.updateReview);
router.post('/:id/reply', authenticate, authorize('admin', 'landlord'), validateRequest(reviewSchema.replyReview), reviewController.addLandlordReply);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.put('/:id/moderate', authenticate, authorize('admin'), validateRequest(reviewSchema.moderateReview), reviewController.moderateReview);

export default router; 