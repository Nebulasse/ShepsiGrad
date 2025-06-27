"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
// Загружаем переменные окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Простой healthcheck для Railway
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'ShepsiGrad Backend API',
        version: '1.0.0',
        status: 'running',
        timestamp: new Date().toISOString()
    });
});
// Healthcheck endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});
// Простой ping endpoint
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});
// Заглушки для API роутов
app.get('/api/properties', (req, res) => {
    res.json({
        message: 'Properties endpoint - placeholder',
        data: []
    });
});
app.get('/api/bookings', (req, res) => {
    res.json({
        message: 'Bookings endpoint - placeholder',
        data: []
    });
});
app.get('/api/users', (req, res) => {
    res.json({
        message: 'Users endpoint - placeholder',
        data: []
    });
});
// Socket.IO обработчики
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
    socket.on('message', (data) => {
        console.log('Received message:', data);
        // Эхо обратно
        socket.emit('message', {
            ...data,
            timestamp: new Date().toISOString(),
            server: 'ShepsiGrad Backend'
        });
    });
});
// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'Something went wrong'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});
const PORT = process.env.PORT || 3000;
// Улучшенная обработка запуска сервера
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.IO server ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
});
// Обработка ошибок сервера
server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
exports.default = app;
