# 🏠 ShepsiGrad Backend

Backend API для приложения аренды недвижимости ShepsiGrad.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшн версии
npm start
```

### Docker

```bash
# Сборка образа
docker build -t shepsigrad-backend .

# Запуск контейнера
docker run -p 3000:3000 shepsigrad-backend

# Тестирование
curl http://localhost:3000/health
```

## 📁 Структура проекта

```
backend/
├── src/
│   └── server.ts          # Основной сервер
├── dist/                  # Скомпилированные файлы
├── Dockerfile             # Основной Dockerfile
├── Dockerfile.minimal     # Минимальный Dockerfile
├── tsconfig.json          # TypeScript конфигурация
└── package.json           # Зависимости
```

## 🔧 Конфигурация

### Переменные окружения

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
JWT_SECRET=your-jwt-secret
```

## 🚀 Деплой

### Railway

См. [deploy-railway.md](./deploy-railway.md) для подробных инструкций.

### Docker

```bash
# Сборка
docker build -t shepsigrad-backend .

# Запуск с переменными окружения
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=your-url \
  -e SUPABASE_ANON_KEY=your-key \
  shepsigrad-backend
```

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Проверка health endpoint
curl http://localhost:3000/health

# Проверка API
curl http://localhost:3000/api/properties
```

## 📡 API Endpoints

- `GET /` - Информация о сервере
- `GET /health` - Health check
- `GET /ping` - Ping endpoint
- `GET /api/properties` - Список недвижимости (заглушка)
- `GET /api/bookings` - Список бронирований (заглушка)
- `GET /api/users` - Список пользователей (заглушка)

## 🔌 WebSocket

Сервер поддерживает WebSocket соединения через Socket.IO:

```javascript
// Подключение
const socket = io("http://localhost:3000");

// Отправка сообщения
socket.emit("message", { text: "Hello!" });

// Получение сообщения
socket.on("message", (data) => {
  console.log("Received:", data);
});
```

## 🐛 Устранение неполадок

### Проблема: npm run build не работает

1. Убедитесь, что папка `_old` перемещена в `_old_backup`
2. Проверьте `tsconfig.json` - он должен включать только `src/server.ts`
3. Очистите папку `dist` и попробуйте снова

### Проблема: Docker сборка не удается

1. Используйте `Dockerfile.minimal` для более простой сборки
2. Проверьте `.dockerignore` - он должен исключать ненужные файлы
3. Убедитесь, что все зависимости указаны в `package.json`

## 📝 Логи

Логи сохраняются в папку `logs/`:

- `all.log` - Все логи
- `error.log` - Только ошибки
- `combined.log` - Комбинированные логи

## 🔒 Безопасность

- Используется Helmet для защиты заголовков
- CORS настроен для безопасности
- JWT для аутентификации
- Валидация входных данных через Zod
