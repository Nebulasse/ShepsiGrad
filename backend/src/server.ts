import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Базовые роуты
app.get('/', (req, res) => {
  res.json({ 
    message: 'ShepsiGrad Backend API', 
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app; 