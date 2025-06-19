import { Router } from 'express';
import { imageController, uploadMiddleware } from '../controllers/imageController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Маршруты требуют аутентификации
router.use(authenticate);

// Загрузка изображения
router.post('/upload', uploadMiddleware, imageController.uploadImage);

// Удаление изображения
router.delete('/:fileId', imageController.deleteImage);

export default router; 