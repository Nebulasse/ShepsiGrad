import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { SocketService } from './services/socketService';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Инициализация WebSocket сервера
const socketService = new SocketService(httpServer);

// Маршруты API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
}); 