import { Router } from 'express';
import { propertyController } from '../controllers/propertyController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { propertySchema, propertyQuerySchema } from '../schemas/validationSchemas';

const router = Router();

// Публичные маршруты
router.get('/', validateQuery(propertyQuerySchema), propertyController.getProperties);
router.get('/:id', propertyController.getPropertyById);

// Защищенные маршруты
// Основные операции с недвижимостью
router.post('/', authenticate, authorize('admin', 'landlord'), validateRequest(propertySchema), propertyController.createProperty);
router.put('/:id', authenticate, authorize('admin', 'landlord'), validateRequest(propertySchema), propertyController.updateProperty);
router.delete('/:id', authenticate, authorize('admin', 'landlord'), propertyController.deleteProperty);
router.get('/user/properties', authenticate, authorize('admin', 'landlord'), validateQuery(propertyQuerySchema), propertyController.getUserProperties);

// Маршруты для работы с изображениями
router.post('/:id/images', authenticate, authorize('admin', 'landlord'), propertyController.addPropertyImages);
router.delete('/:id/images/:imageId', authenticate, authorize('admin', 'landlord'), propertyController.deletePropertyImage);
router.put('/:id/images/:imageId/primary', authenticate, authorize('admin', 'landlord'), propertyController.setPrimaryImage);

export default router; 