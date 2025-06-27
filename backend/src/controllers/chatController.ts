import { Response } from 'express';
import { ChatModel, MessageModel } from '../models/Chat';
import { AuthRequest } from '../middleware/auth';
import { LoggerService } from '../services/loggerService';
import { PropertyModel } from '../models/Property';
import { UserModel } from '../models/User';
import { BookingModel } from '../models/Booking';
import { socketService } from '../app';

export const chatController = {
    async getUserChats(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const chats = await ChatModel.findUserChats(req.user.id);

            // Получаем дополнительную информацию для чатов
            const chatsWithDetails = await Promise.all(
                chats.map(async (chat) => {
                    const otherUserId = chat.guest_id === req.user?.id ? chat.host_id : chat.guest_id;
                    const otherUser = await UserModel.findById(otherUserId);

                    // Получаем информацию о недвижимости или бронировании, если они есть
                    let property = null;
                    let booking = null;

                    if (chat.property_id) {
                        property = await PropertyModel.findById(chat.property_id);
                    }

                    if (chat.booking_id) {
                        booking = await BookingModel.findById(chat.booking_id);
                    }

                    // Получаем количество непрочитанных сообщений для текущего пользователя
                    const { count: unreadCount } = await MessageModel.getChatUnreadCount(chat.id, req.user?.id);

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
                })
            );

            res.json(chatsWithDetails);
        } catch (error) {
            LoggerService.error('Error getting user chats', { error, userId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getChatMessages(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { chatId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            // Проверяем, принадлежит ли чат пользователю
            const chat = await ChatModel.findChatById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            if (chat.guest_id !== req.user.id && chat.host_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const { messages, total } = await MessageModel.getChatMessages(chatId, { page, limit });

            // Отмечаем сообщения как прочитанные
            await MessageModel.markAsRead(chatId, req.user.id);

            res.json({
                messages,
                total,
                page,
                limit
            });
        } catch (error) {
            LoggerService.error('Error getting chat messages', { 
                error, 
                userId: req.user?.id,
                chatId: req.params.chatId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async sendMessage(req: AuthRequest, res: Response) {
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
            const chat = await ChatModel.findChatById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found' });
            }

            if (chat.guest_id !== req.user.id && chat.host_id !== req.user.id) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const message = await MessageModel.createMessage({
                chat_id: chatId,
                sender_id: req.user.id,
                content,
                is_read: false
            });

            res.status(201).json(message);
        } catch (error) {
            LoggerService.error('Error sending message', { 
                error, 
                userId: req.user?.id,
                chatId: req.params.chatId,
                content: req.body.content
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createPropertyChat(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { propertyId } = req.params;
            
            // Получаем информацию о недвижимости
            const property = await PropertyModel.findById(propertyId);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            // Определяем, кто гость, а кто хозяин
            let guestId, hostId;
            
            if (property.owner_id === req.user.id) {
                return res.status(400).json({ error: 'Cannot chat with yourself' });
            } else {
                guestId = req.user.id;
                hostId = property.owner_id;
            }

            // Создаем или находим чат
            const chat = await ChatModel.findOrCreatePropertyChat(guestId, hostId, propertyId);
            
            res.status(201).json(chat);
        } catch (error) {
            LoggerService.error('Error creating property chat', { 
                error, 
                userId: req.user?.id,
                propertyId: req.params.propertyId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async createBookingChat(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { bookingId } = req.params;
            
            // Получаем информацию о бронировании
            const booking = await BookingModel.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ error: 'Booking not found' });
            }

            // Получаем информацию о недвижимости
            const property = await PropertyModel.findById(booking.property_id);
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
            const chat = await ChatModel.findOrCreateBookingChat(guestId, hostId, bookingId);
            
            res.status(201).json(chat);
        } catch (error) {
            LoggerService.error('Error creating booking chat', { 
                error, 
                userId: req.user?.id,
                bookingId: req.params.bookingId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getUnreadCount(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { count } = await MessageModel.getUserUnreadCount(req.user.id);
            res.json({ count });
        } catch (error) {
            LoggerService.error('Error getting unread count', { error, userId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Тестовый метод для проверки работы чата между приложениями
    async testChatConnection(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { recipientId, message } = req.body;

            if (!recipientId || !message) {
                return res.status(400).json({ error: 'Recipient ID and message are required' });
            }

            // Проверяем, существует ли получатель
            const recipient = await UserModel.findById(recipientId);
            if (!recipient) {
                return res.status(404).json({ error: 'Recipient not found' });
            }

            // Отправляем сообщение через WebSocket
            socketService.sendPrivateMessage(req.user.id, recipientId, message);

            // Возвращаем успешный ответ
            res.json({ 
                success: true, 
                message: 'Test message sent',
                sender: req.user.id,
                recipient: recipientId
            });
        } catch (error) {
            LoggerService.error('Error testing chat connection', { 
                error, 
                userId: req.user?.id,
                recipientId: req.body.recipientId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}; 