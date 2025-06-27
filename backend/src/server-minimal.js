const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Создание экземпляра приложения
const app = express();
const port = process.env.PORT || 3000;

// Применение middleware
app.use(helmet()); // Заголовки безопасности
app.use(compression()); // Сжатие ответов
app.use(cors({ origin: '*' })); // CORS
app.use(express.json()); // Парсинг JSON
app.use(express.urlencoded({ extended: true })); // Парсинг URL-encoded данных

// Логирование запросов
app.use(morgan('dev'));

// Эндпоинт для проверки работоспособности
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// API маршруты
app.get('/api/users', (req, res) => {
  res.status(200).json({
    users: [
      { id: 1, name: 'Тест Тестов', email: 'test@example.com', role: 'user' }
    ]
  });
});

// Маршруты аутентификации
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Простая проверка
  if (email === 'test@example.com' && password === 'password') {
    res.status(200).json({
      message: 'Вход выполнен успешно',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'Тест',
        lastName: 'Тестов',
        role: 'user'
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    });
  } else {
    res.status(401).json({
      message: 'Неверные учетные данные'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  res.status(201).json({
    message: 'Пользователь успешно зарегистрирован',
    user: {
      id: Date.now(),
      email,
      firstName,
      lastName,
      role: 'user'
    },
    tokens: {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token'
    }
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Запрашиваемый ресурс не найден',
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(`Ошибка приложения: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    message: 'Внутренняя ошибка сервера',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port} в режиме ${process.env.NODE_ENV || 'development'}`);
}); 