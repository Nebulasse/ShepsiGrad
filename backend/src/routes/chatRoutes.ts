import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticate } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { querySchema } from '../schemas/validationSchemas';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authenticate);

// Получение списка чатов пользователя
router.get('/', chatController.getUserChats);

// Получение количества непрочитанных сообщений
router.get('/unread/count', chatController.getUnreadCount);

// Создание чата для объекта недвижимости
router.post('/property/:propertyId', chatController.createPropertyChat);

// Создание чата для бронирования
router.post('/booking/:bookingId', chatController.createBookingChat);

// Работа с конкретным чатом
router.get('/:chatId/messages', validateQuery(querySchema), chatController.getChatMessages);
router.post('/:chatId/messages', chatController.sendMessage);

// Тестовый маршрут для проверки чата между приложениями
router.post('/test/connection', chatController.testChatConnection);

export default router; 