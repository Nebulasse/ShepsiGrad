import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import userController from '../controllers/userController';
import validateRequest from '../middleware/validation.middleware';
import { userSchema } from '../schemas/validationSchemas';

const router = express.Router();

// Публичные маршруты
router.get('/public/:id', (req, res) => {
  res.status(200).json({ message: 'Публичный профиль пользователя' });
});

// Защищенные маршруты
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateRequest(userSchema.updateProfile), userController.updateProfile);
router.delete('/profile', authenticate, userController.deleteProfile);

// Маршруты для администраторов
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.get('/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Информация о пользователе' });
});
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Пользователь обновлен' });
});
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  res.status(200).json({ message: 'Пользователь удален' });
});

export default router; 