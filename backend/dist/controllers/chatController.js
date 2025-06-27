"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const Chat_1 = require("../models/Chat");
const loggerService_1 = require("../services/loggerService");
const Property_1 = require("../models/Property");
const User_1 = require("../models/User");
const Booking_1 = require("../models/Booking");
const app_1 = require("../app");
exports.chatController = {
    async getUserChats(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const chats = await Chat_1.ChatModel.findUserChats(req.user.id);
            // Получаем дополнительную информацию для чатов
            const chatsWithDetails = await Promise.all(chats.map(async (chat) => {
                var _a, _b;
                const otherUserId = chat.guest_id === ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) ? chat.host_id : chat.guest_id;
                const otherUser = await User_1.UserModel.findById(otherUserId);
                // Получаем информацию о недвижимости или бронировании, если они есть
                let property = null;
                let booking = null;
                if (chat.property_id) {
                    property = await Property_1.PropertyModel.findById(chat.property_id);
                }
                if (chat.booking_id) {
                    booking = await Booking_1.BookingModel.findById(chat.booking_id);
                }
                // Получаем количество непрочитанных сообщений для текущего пользователя
                const { count: unreadCount } = await Chat_1.MessageModel.getChatUnreadCount(chat.id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                return {
                    ...chat,
                    other_user: otherUser ? {
                        id: otherUser.id,
                        full_name: otherUser.full_name,
                        email: otherUser.email
                    } : null,
                    property: property ? {
                        id: property.id,
                        title: property.title,
                        address: property.address
                    } : null,
                    booking: booking ? {
                        id: booking.id,
                        check_in_date: booking.check_in_date,
                        check_out_date: booking.check_out_date
                    } : null,
                    unread_count: unreadCount
                };
            }));
            res.json(chatsWithDetails);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting user chats', { error, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getChatMessages(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { chatId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            // Проверяем, принадлежит ли чат пользователю
            const chat = await Chat_1.ChatModel.findChatById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            if (chat.guest_id !== req.user.id && chat.host_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { messages, total } = await Chat_1.MessageModel.getChatMessages(chatId, { page, limit });
            // Отмечаем сообщения как прочитанные
            await Chat_1.MessageModel.markAsRead(chatId, req.user.id);
            res.json({
                messages,
                total,
                page,
                limit
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting chat messages', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                chatId: req.params.chatId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async sendMessage(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { chatId } = req.params;
            const { content } = req.body;
            if (!content) {
                return res.status(400).json({ error: 'Message content is required' });
            }
            // Проверяем, принадлежит ли чат пользователю
            const chat = await Chat_1.ChatModel.findChatById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }
            if (chat.guest_id !== req.user.id && chat.host_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const message = await Chat_1.MessageModel.createMessage({
                chat_id: chatId,
                sender_id: req.user.id,
                content,
                is_read: false
            });
            res.status(201).json(message);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error sending message', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                chatId: req.params.chatId,
                content: req.body.content
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async createPropertyChat(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { propertyId } = req.params;
            // Получаем информацию о недвижимости
            const property = await Property_1.PropertyModel.findById(propertyId);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            // Определяем, кто гость, а кто хозяин
            let guestId, hostId;
            if (property.owner_id === req.user.id) {
                return res.status(400).json({ error: 'Cannot chat with yourself' });
            }
            else {
                guestId = req.user.id;
                hostId = property.owner_id;
            }
            // Создаем или находим чат
            const chat = await Chat_1.ChatModel.findOrCreatePropertyChat(guestId, hostId, propertyId);
            res.status(201).json(chat);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error creating property chat', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                propertyId: req.params.propertyId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async createBookingChat(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { bookingId } = req.params;
            // Получаем информацию о бронировании
            const booking = await Booking_1.BookingModel.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }
            // Получаем информацию о недвижимости
            const property = await Property_1.PropertyModel.findById(booking.property_id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            // Проверяем, что пользователь является участником бронирования
            if (booking.guest_id !== req.user.id && property.owner_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            // Определяем, кто гость, а кто хозяин
            const guestId = booking.guest_id;
            const hostId = property.owner_id;
            // Создаем или находим чат
            const chat = await Chat_1.ChatModel.findOrCreateBookingChat(guestId, hostId, bookingId);
            res.status(201).json(chat);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error creating booking chat', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                bookingId: req.params.bookingId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getUnreadCount(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { count } = await Chat_1.MessageModel.getUserUnreadCount(req.user.id);
            res.json({ count });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting unread count', { error, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Тестовый метод для проверки работы чата между приложениями
    async testChatConnection(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { recipientId, message } = req.body;
            if (!recipientId || !message) {
                return res.status(400).json({ error: 'Recipient ID and message are required' });
            }
            // Проверяем, существует ли получатель
            const recipient = await User_1.UserModel.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ error: 'Recipient not found' });
            }
            // Отправляем сообщение через WebSocket
            app_1.socketService.sendPrivateMessage(req.user.id, recipientId, message);
            // Возвращаем успешный ответ
            res.json({
                success: true,
                message: 'Test message sent',
                sender: req.user.id,
                recipient: recipientId
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error testing chat connection', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                recipientId: req.body.recipientId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
