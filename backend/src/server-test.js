const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
  // Обслуживаем статические файлы из директории public
  if (req.url === '/') {
    // Перенаправляем на страницу тестирования
    res.writeHead(302, { 'Location': '/websocket-test.html' });
    res.end();
    return;
  }
  
  // Получаем путь к файлу
  const filePath = path.join(__dirname, '..', 'public', req.url === '/' ? 'index.html' : req.url);
  
  // Определяем Content-Type на основе расширения файла
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Проверяем существование файла
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Файл не найден
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1><p>Запрашиваемый файл не найден.</p>');
      } else {
        // Ошибка сервера
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`<h1>500 Internal Server Error</h1><p>${error.code}</p>`);
      }
    } else {
      // Файл найден, отправляем его
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Создаем WebSocket сервер
const io = new Server(server, {
  cors: {
    origin: '*', // Разрешаем подключения с любого источника
    methods: ['GET', 'POST']
  }
});

// Хранилище подключенных пользователей
const connectedUsers = new Map();

// Обработка подключений
io.on('connection', (socket) => {
  console.log(`Новое подключение: ${socket.id}`);
  
  // Аутентификация
  socket.on('authenticate', (data) => {
    const { userId, appType } = data;
    
    if (!userId) {
      socket.emit('error', { message: 'Требуется ID пользователя' });
      return;
    }
    
    // Сохраняем информацию о пользователе
    socket.data.user = { id: userId };
    socket.data.appType = appType || 'tenant';
    
    // Добавляем пользователя в список подключенных
    connectedUsers.set(userId, {
      userId,
      socketId: socket.id,
      appType: socket.data.appType
    });
    
    console.log(`Пользователь авторизован: ${userId} (${socket.data.appType})`);
    socket.emit('authenticated', { userId, appType: socket.data.appType });
  });
  
  // Обработка личных сообщений
  socket.on('private_message', (data) => {
    const { to, message } = data;
    const user = socket.data.user;
    
    if (!user) {
      socket.emit('error', { message: 'Требуется авторизация' });
      return;
    }
    
    console.log(`Сообщение от ${user.id} для ${to}: ${message}`);
    
    // Находим получателя
    const recipient = connectedUsers.get(to);
    if (recipient) {
      io.to(recipient.socketId).emit('private_message', {
        from: user.id,
        message,
        timestamp: new Date()
      });
      
      // Подтверждение отправителю
      socket.emit('message_sent', { to, timestamp: new Date() });
    } else {
      socket.emit('error', { message: 'Получатель не в сети' });
    }
  });
  
  // Обработка уведомлений
  socket.on('notification', (data) => {
    const { to, type, content } = data;
    const user = socket.data.user;
    
    if (!user) {
      socket.emit('error', { message: 'Требуется авторизация' });
      return;
    }
    
    console.log(`Уведомление от ${user.id} для ${to}: ${type}`);
    
    // Находим получателя
    const recipient = connectedUsers.get(to);
    if (recipient) {
      io.to(recipient.socketId).emit('notification', {
        from: user.id,
        type,
        content,
        timestamp: new Date()
      });
    }
  });
  
  // Широковещательное сообщение
  socket.on('broadcast', (data) => {
    const { message, targetType } = data;
    const user = socket.data.user;
    
    if (!user) {
      socket.emit('error', { message: 'Требуется авторизация' });
      return;
    }
    
    console.log(`Широковещательное сообщение от ${user.id}: ${message}`);
    
    if (targetType) {
      // Отправка сообщения определенному типу пользователей
      const targets = Array.from(connectedUsers.values())
        .filter(u => u.appType === targetType)
        .map(u => u.socketId);
      
      io.to(targets).emit('broadcast_message', {
        from: user.id,
        message,
        timestamp: new Date()
      });
    } else {
      // Отправка всем пользователям
      io.emit('broadcast_message', {
        from: user.id,
        message,
        timestamp: new Date()
      });
    }
  });
  
  // Получение списка подключенных пользователей
  socket.on('get_users', () => {
    const users = Array.from(connectedUsers.values()).map(u => ({
      userId: u.userId,
      appType: u.appType
    }));
    
    socket.emit('users_list', users);
  });
  
  // Отключение
  socket.on('disconnect', () => {
    const user = socket.data.user;
    if (user) {
      console.log(`Пользователь отключился: ${user.id}`);
      connectedUsers.delete(user.id);
    } else {
      console.log(`Соединение разорвано: ${socket.id}`);
    }
  });
});

// Запускаем сервер
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Тестовый WebSocket сервер запущен на порту ${PORT}`);
  console.log(`Для тестирования откройте http://localhost:${PORT} в браузере`);
}); 