"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiService = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const syncService_1 = require("./syncService");
const loggerService_1 = require("./loggerService");
class ApiService {
    constructor(options = {}) {
        this.isInitialized = false;
        this.app = (0, express_1.default)();
        this.port = options.port || 4000;
        this.enableCors = options.enableCors !== false;
        this.allowedOrigins = options.allowedOrigins || ['*'];
    }
    // Инициализация сервиса API
    async initialize() {
        if (this.isInitialized) {
            return;
        }
        // Настройка CORS
        if (this.enableCors) {
            const corsOptions = {
                origin: (origin, callback) => {
                    if (!origin || this.allowedOrigins.includes('*') || this.allowedOrigins.includes(origin)) {
                        callback(null, true);
                    }
                    else {
                        callback(new Error('Не разрешено политикой CORS'));
                    }
                },
                credentials: true,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-App-ID', 'X-Client-Version']
            };
            this.app.use((0, cors_1.default)(corsOptions));
        }
        // Middleware для определения источника запроса
        this.app.use((req, res, next) => {
            const appId = req.headers['x-app-id'];
            const clientVersion = req.headers['x-client-version'];
            if (appId) {
                req.app.locals.appId = appId;
                req.app.locals.clientVersion = clientVersion;
                loggerService_1.logger.debug(`Request from app: ${appId}, version: ${clientVersion}`);
            }
            next();
        });
        // Middleware для обработки JSON
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Healthcheck эндпоинт
        this.app.get('/api/health', (req, res) => {
            res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
        });
        // Запуск сервера
        this.app.listen(this.port, () => {
            loggerService_1.logger.info(`Unified API service running on port ${this.port}`);
            this.isInitialized = true;
        });
    }
    // Добавление маршрутов API
    addRoutes(routes) {
        this.app.use('/api', routes);
    }
    // Добавление WebSocket обработчика для реального времени
    setupWebsocketHandlers(server) {
        const io = require('socket.io')(server, {
            cors: {
                origin: this.allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        // Обработка подключений клиентов
        io.on('connection', (socket) => {
            const appId = socket.handshake.query.appId;
            loggerService_1.logger.info(`Socket connected: ${socket.id} from app: ${appId}`);
            // Аутентификация клиента
            socket.on('authenticate', (data) => {
                // Здесь можно добавить проверку токена
                const { token } = data;
                // После успешной аутентификации настраиваем слушателей событий
                this.setupSocketEventListeners(socket, appId);
            });
            // Отключение клиента
            socket.on('disconnect', () => {
                loggerService_1.logger.info(`Socket disconnected: ${socket.id}`);
            });
        });
        // Настройка мостов между событиями синхронизации и WebSocket
        this.setupSyncEventBridges(io);
    }
    // Настройка слушателей событий для сокета
    setupSocketEventListeners(socket, appId) {
        // Чат
        socket.on('join-chat', (chatId) => {
            socket.join(`chat:${chatId}`);
        });
        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
        });
        socket.on('send-message', async (data) => {
            // Сохраняем сообщение и публикуем событие синхронизации
            const { chatId, message } = data;
            await syncService_1.syncService.publish(syncService_1.SyncChannel.CHAT_MESSAGE, 'new-message', {
                chatId,
                message,
                sender: appId
            });
        });
        // Подписка на обновления объектов недвижимости
        socket.on('subscribe-property', (propertyId) => {
            socket.join(`property:${propertyId}`);
        });
        // Подписка на уведомления
        socket.on('subscribe-notifications', (userId) => {
            socket.join(`notifications:${userId}`);
        });
    }
    // Настройка мостов между событиями синхронизации и WebSocket
    setupSyncEventBridges(io) {
        // Мост для сообщений чата
        syncService_1.syncService.subscribe(syncService_1.SyncChannel.CHAT_MESSAGE, (event) => {
            const { chatId, message } = event.payload;
            io.to(`chat:${chatId}`).emit('new-message', message);
        });
        // Мост для обновлений объектов недвижимости
        syncService_1.syncService.subscribe(syncService_1.SyncChannel.PROPERTY_UPDATE, (event) => {
            const { documentId, document, operationType } = event.payload;
            io.to(`property:${documentId}`).emit('property-update', {
                propertyId: documentId,
                data: document,
                operation: operationType
            });
        });
        // Мост для уведомлений
        syncService_1.syncService.subscribe(syncService_1.SyncChannel.NOTIFICATION, (event) => {
            const notification = event.payload;
            if (notification.userId) {
                io.to(`notifications:${notification.userId}`).emit('new-notification', notification);
            }
        });
        // Мост для бронирований
        syncService_1.syncService.subscribe(syncService_1.SyncChannel.BOOKING_UPDATE, (event) => {
            const { documentId, document, operationType } = event.payload;
            // Уведомляем всех клиентов, подписанных на объект недвижимости
            if (document && document.propertyId) {
                io.to(`property:${document.propertyId}`).emit('booking-update', {
                    bookingId: documentId,
                    data: document,
                    operation: operationType
                });
            }
            // Уведомляем владельца и арендатора
            if (document) {
                if (document.ownerId) {
                    io.to(`notifications:${document.ownerId}`).emit('booking-update', {
                        bookingId: documentId,
                        data: document,
                        operation: operationType
                    });
                }
                if (document.userId) {
                    io.to(`notifications:${document.userId}`).emit('booking-update', {
                        bookingId: documentId,
                        data: document,
                        operation: operationType
                    });
                }
            }
        });
    }
}
// Экспортируем единственный экземпляр сервиса
exports.apiService = new ApiService();
