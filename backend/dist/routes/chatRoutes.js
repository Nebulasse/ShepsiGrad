"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = (0, express_1.Router)();
// Все маршруты требуют аутентификации
router.use(auth_1.authenticate);
// Получение списка чатов пользователя
router.get('/', chatController_1.chatController.getUserChats);
// Получение количества непрочитанных сообщений
router.get('/unread/count', chatController_1.chatController.getUnreadCount);
// Создание чата для объекта недвижимости
router.post('/property/:propertyId', chatController_1.chatController.createPropertyChat);
// Создание чата для бронирования
router.post('/booking/:bookingId', chatController_1.chatController.createBookingChat);
// Работа с конкретным чатом
router.get('/:chatId/messages', (0, validation_1.validateQuery)(validationSchemas_1.querySchema), chatController_1.chatController.getChatMessages);
router.post('/:chatId/messages', chatController_1.chatController.sendMessage);
// Тестовый маршрут для проверки чата между приложениями
router.post('/test/connection', chatController_1.chatController.testChatConnection);
exports.default = router;
