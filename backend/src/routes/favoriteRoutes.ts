import express from 'express';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites, 
  checkIsFavorite 
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { querySchema } from '../schemas/validationSchemas';

const router = express.Router();

// Все маршруты защищены аутентификацией
router.use(authenticate);

// Добавить объект в избранное
router.post('/', addToFavorites);

// Получить список избранных объектов
router.get('/', getUserFavorites);

// Проверить, есть ли объект в избранном
router.get('/:propertyId/check', checkIsFavorite);

// Удалить объект из избранного
router.delete('/:propertyId', removeFromFavorites);

export default router; 