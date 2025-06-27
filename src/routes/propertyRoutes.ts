import { Router } from 'express';
import propertyController from '../controllers/propertyController';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateZod } from '../middleware/validation.middleware';
import * as propertySchema from '../schemas/property.schema';
import multer from 'multer';

// Настройка multer для обработки загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 МБ
    files: 10 // максимальное количество файлов
  },
  fileFilter: (req, file, cb) => {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения'));
    }
  }
});

const router = Router();

// Получение всех объектов недвижимости (доступно всем)
router.get('/', propertyController.getAllProperties);

// Поиск объектов недвижимости по местоположению
router.get('/search/location', propertyController.searchByLocation);

// Получение объекта недвижимости по ID
router.get('/:id', propertyController.getPropertyById);

// Получение объектов недвижимости пользователя
router.get('/user/:userId?', authenticate, propertyController.getUserProperties);

// Создание нового объекта недвижимости (требуется аутентификация)
router.post('/', authenticate, authorize('landlord', 'admin'), validateZod(propertySchema.createProperty), propertyController.createProperty);

// Обновление объекта недвижимости
router.put('/:id', authenticate, validateZod(propertySchema.updateProperty), propertyController.updateProperty);

// Удаление объекта недвижимости
router.delete('/:id', authenticate, propertyController.deleteProperty);

// Загрузка изображений для объекта недвижимости
router.post('/:id/images', authenticate, upload.array('images'), propertyController.uploadImages);

// Установка главного изображения для объекта недвижимости
router.post('/:id/main-image', authenticate, validateZod(propertySchema.setMainImage), propertyController.setMainImage);

// Удаление изображения из объекта недвижимости
router.delete('/:id/images', authenticate, validateZod(propertySchema.deleteImage), propertyController.deleteImage);

// Модерация объекта недвижимости (только администратор)
router.put('/:id/moderate', authenticate, authorize('admin'), validateZod(propertySchema.moderateProperty), propertyController.moderateProperty);

export default router; 