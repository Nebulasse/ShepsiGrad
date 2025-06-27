# ShepsiGrad Rental App Backend

Бэкенд для приложения аренды недвижимости ShepsiGrad.

## Технологии

- Node.js
- Express
- TypeScript
- TypeORM
- PostgreSQL
- JWT для аутентификации
- Docker
- Kubernetes для деплоя

## Требования

- Node.js 16+
- PostgreSQL 13+
- Docker (опционально)
- Kubernetes (для продакшн деплоя)

## Установка

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

## Запуск для разработки

```bash
# Запуск в режиме разработки
npm run dev

# Запуск с отладкой
npm run dev:debug
```

## Сборка и запуск

```bash
# Сборка проекта
npm run build

# Запуск собранного проекта
npm start
```

## Docker

```bash
# Сборка Docker образа
docker build -t shepsigrad-backend .

# Запуск контейнера
docker run -p 3000:3000 --env-file .env shepsigrad-backend
```

## Kubernetes деплой

Инструкции по деплою в Kubernetes находятся в директории [kubernetes/dev](kubernetes/dev/README.md).

## Структура проекта

```
src/
  ├── app.ts           # Конфигурация Express приложения
  ├── server.ts        # Точка входа
  ├── config/          # Конфигурационные файлы
  ├── controllers/     # Контроллеры
  ├── middleware/      # Промежуточное ПО
  ├── models/          # Модели данных
  ├── routes/          # Маршруты API
  ├── services/        # Бизнес-логика
  ├── utils/           # Утилиты
  └── tests/           # Тесты
```

## API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/logout` - Выход
- `POST /api/auth/refresh` - Обновление токена

### Пользователи

- `GET /api/users/profile` - Получение профиля
- `PUT /api/users/profile` - Обновление профиля
- `DELETE /api/users/profile` - Удаление профиля

### Недвижимость

- `GET /api/properties` - Список объектов недвижимости
- `GET /api/properties/:id` - Детали объекта
- `POST /api/properties` - Создание объекта
- `PUT /api/properties/:id` - Обновление объекта
- `DELETE /api/properties/:id` - Удаление объекта

### Бронирования

- `GET /api/bookings` - Список бронирований
- `GET /api/bookings/:id` - Детали бронирования
- `POST /api/bookings` - Создание бронирования
- `PUT /api/bookings/:id` - Обновление бронирования
- `DELETE /api/bookings/:id` - Отмена бронирования

### Отзывы

- `GET /api/reviews` - Список отзывов
- `GET /api/reviews/:id` - Детали отзыва
- `POST /api/reviews` - Создание отзыва
- `PUT /api/reviews/:id` - Обновление отзыва
- `DELETE /api/reviews/:id` - Удаление отзыва

### Чаты

- `GET /api/chats` - Список чатов
- `GET /api/chats/:id` - Детали чата
- `POST /api/chats` - Создание чата
- `POST /api/chats/:id/messages` - Отправка сообщения

## Тестирование

```bash
# Запуск всех тестов
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск интеграционных тестов
npm run test:integration

# Запуск модульных тестов
npm run test:unit
```

## Лицензия

MIT
