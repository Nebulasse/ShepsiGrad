"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = require("jsonwebtoken");
const User_1 = require("../models/User");
const loggerService_1 = require("./loggerService");
class SocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: '*', // Разрешаем подключения с любого источника
                methods: ['GET', 'POST']
            }
        });
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                const appType = socket.handshake.auth.appType || 'tenant';
                if (!token) {
                    return next(new Error('Требуется авторизация'));
                }
                const decoded = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User_1.UserModel.findById(decoded.id);
                if (!user) {
                    return next(new Error('Пользователь не найден'));
                }
                socket.data.user = user;
                socket.data.appType = appType;
                loggerService_1.LoggerService.info(`WebSocket: пользователь авторизован`, {
                    userId: user.id,
                    appType
                });
                next();
            }
            catch (error) {
                loggerService_1.LoggerService.error('WebSocket: ошибка аутентификации', { error });
                next(new Error('Ошибка аутентификации'));
            }
        });
        this.io.on('connection', (socket) => {
            const user = socket.data.user;
            const appType = socket.data.appType;
            loggerService_1.LoggerService.info(`WebSocket: пользователь подключился`, {
                userId: user.id,
                appType
            });
            // Сохраняем информацию о подключенном пользователе
            this.connectedUsers.set(user.id, {
                userId: user.id,
                socketId: socket.id,
                appType
            });
            // Обработка личных сообщений
            socket.on('private_message', async (data) => {
                const recipient = this.connectedUsers.get(data.to);
                if (recipient) {
                    this.io.to(recipient.socketId).emit('private_message', {
                        from: user.id,
                        message: data.message,
                        propertyId: data.propertyId,
                        timestamp: new Date()
                    });
                    loggerService_1.LoggerService.info(`WebSocket: отправлено личное сообщение`, {
                        from: user.id,
                        to: data.to,
                        propertyId: data.propertyId
                    });
                }
            });
            // Обработка уведомлений
            socket.on('notification', async (data) => {
                const recipient = this.connectedUsers.get(data.to);
                if (recipient) {
                    this.io.to(recipient.socketId).emit('notification', {
                        from: user.id,
                        type: data.type,
                        content: data.content,
                        timestamp: new Date()
                    });
                    loggerService_1.LoggerService.info(`WebSocket: отправлено уведомление`, {
                        from: user.id,
                        to: data.to,
                        type: data.type
                    });
                }
            });
            // Обработка отключения
            socket.on('disconnect', () => {
                loggerService_1.LoggerService.info(`WebSocket: пользователь отключился`, {
                    userId: user.id,
                    appType
                });
                this.connectedUsers.delete(user.id);
            });
        });
    }
    // Метод для отправки уведомления конкретному пользователю
    sendNotification(userId, type, content) {
        const user = this.connectedUsers.get(userId);
        if (user) {
            this.io.to(user.socketId).emit('notification', {
                type,
                content,
                timestamp: new Date()
            });
            loggerService_1.LoggerService.info(`WebSocket: отправлено уведомление через API`, {
                to: userId,
                type
            });
        }
    }
    // Метод для отправки сообщения конкретному пользователю
    sendPrivateMessage(from, to, message, propertyId) {
        const recipient = this.connectedUsers.get(to);
        if (recipient) {
            this.io.to(recipient.socketId).emit('private_message', {
                from,
                message,
                propertyId,
                timestamp: new Date()
            });
            loggerService_1.LoggerService.info(`WebSocket: отправлено личное сообщение через API`, {
                from,
                to,
                propertyId
            });
        }
    }
    // Метод для отправки сообщения всем пользователям определенного типа
    broadcastMessage(message, appType) {
        if (appType) {
            // Находим всех пользователей указанного типа
            const targetSockets = Array.from(this.connectedUsers.values())
                .filter(user => user.appType === appType)
                .map(user => user.socketId);
            // Отправляем сообщение только этим пользователям
            this.io.to(targetSockets).emit('broadcast_message', {
                message,
                timestamp: new Date()
            });
            loggerService_1.LoggerService.info(`WebSocket: отправлено широковещательное сообщение`, {
                appType,
                recipientCount: targetSockets.length
            });
        }
        else {
            // Отправляем всем
            this.io.emit('broadcast_message', {
                message,
                timestamp: new Date()
            });
            loggerService_1.LoggerService.info(`WebSocket: отправлено широковещательное сообщение всем пользователям`);
        }
    }
    // Получить список подключенных пользователей
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
}
exports.SocketService = SocketService;
