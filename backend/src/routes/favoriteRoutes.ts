import express from 'express';
import favoriteController from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Маршруты для работы с избранным
router.post('/', authenticate, favoriteController.addToFavorites);
router.get('/', authenticate, favoriteController.getUserFavorites);
router.get('/:propertyId/check', authenticate, favoriteController.checkIsFavorite);
router.delete('/:propertyId', authenticate, favoriteController.removeFromFavorites);

export default router; 