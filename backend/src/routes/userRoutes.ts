import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { userSchema } from '../schemas/validationSchemas';

const router = Router();

// Защищенные маршруты
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, validateRequest(userSchema), userController.updateProfile);
router.delete('/profile', authenticate, userController.deleteProfile);

// Административные маршруты
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.put('/:userId/role', authenticate, authorize('admin'), validateRequest(userSchema), userController.updateUserRole);

export default router; 