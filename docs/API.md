# API Documentation

## Общая информация

- Базовый URL: `/api/v1`
- Все запросы и ответы используют формат JSON
- Аутентификация: JWT токен в заголовке `Authorization: Bearer <token>`
- Коды ответов:
  - 200: Успешный запрос
  - 201: Ресурс успешно создан
  - 400: Некорректный запрос
  - 401: Не авторизован
  - 403: Доступ запрещен
  - 404: Ресурс не найден
  - 500: Внутренняя ошибка сервера

## Эндпоинты

### Здоровье системы

#### Проверка работоспособности

```
GET /health
```

Возвращает статус работоспособности сервера.

**Ответ:**

```json
{
  "status": "ok",
  "timestamp": "2023-06-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

#### Метрики

```
GET /metrics
```

Возвращает метрики сервера для Prometheus.

**Ответ:**

```json
{
  "status": "ok",
  "metrics": {
    "memory": {
      "rss": 45056000,
      "heapTotal": 23195648,
      "heapUsed": 17368128,
      "external": 3072000
    },
    "cpu": {
      "user": 125000,
      "system": 75000
    },
    "uptime": 3600
  }
}
```

### Аутентификация

#### Регистрация пользователя

```
POST /auth/register
```

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "tenant" // или "landlord"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "tenant",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Вход пользователя

```
POST /auth/login
```

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Ответ:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tenant"
  }
}
```

#### Обновление токена

```
POST /auth/refresh
```

**Тело запроса:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Выход пользователя

```
POST /auth/logout
```

**Тело запроса:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Ответ:**

```json
{
  "message": "Успешный выход из системы"
}
```

### Объекты недвижимости

#### Получение списка объектов

```
GET /properties
```

**Параметры запроса:**

- `page` (число): номер страницы (по умолчанию 1)
- `limit` (число): количество объектов на странице (по умолчанию 10)
- `city` (строка): фильтр по городу
- `minPrice` (число): минимальная цена
- `maxPrice` (число): максимальная цена
- `bedrooms` (число): количество спален
- `amenities` (строка): список удобств через запятую

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Современная квартира в центре",
      "description": "Уютная квартира с прекрасным видом",
      "price": 1500,
      "address": "ул. Примерная, 123",
      "city": "Москва",
      "bedrooms": 2,
      "bathrooms": 1,
      "area": 75,
      "amenities": ["wifi", "parking", "gym"],
      "images": ["image1.jpg", "image2.jpg"],
      "landlordId": "123e4567-e89b-12d3-a456-426614174001",
      "createdAt": "2023-06-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

#### Получение объекта по ID

```
GET /properties/:id
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Современная квартира в центре",
  "description": "Уютная квартира с прекрасным видом",
  "price": 1500,
  "address": "ул. Примерная, 123",
  "city": "Москва",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 75,
  "amenities": ["wifi", "parking", "gym"],
  "images": ["image1.jpg", "image2.jpg"],
  "landlord": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "firstName": "Jane",
    "lastName": "Smith",
    "rating": 4.8
  },
  "reviews": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "rating": 5,
      "comment": "Отличная квартира!",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "firstName": "Alex",
        "lastName": "Johnson"
      },
      "createdAt": "2023-06-10T10:30:00.000Z"
    }
  ],
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Создание объекта

```
POST /properties
```

**Тело запроса:**

```json
{
  "title": "Современная квартира в центре",
  "description": "Уютная квартира с прекрасным видом",
  "price": 1500,
  "address": "ул. Примерная, 123",
  "city": "Москва",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 75,
  "amenities": ["wifi", "parking", "gym"]
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Современная квартира в центре",
  "description": "Уютная квартира с прекрасным видом",
  "price": 1500,
  "address": "ул. Примерная, 123",
  "city": "Москва",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 75,
  "amenities": ["wifi", "parking", "gym"],
  "landlordId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Обновление объекта

```
PUT /properties/:id
```

**Тело запроса:**

```json
{
  "title": "Обновленное название",
  "price": 1600
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Обновленное название",
  "description": "Уютная квартира с прекрасным видом",
  "price": 1600,
  "address": "ул. Примерная, 123",
  "city": "Москва",
  "bedrooms": 2,
  "bathrooms": 1,
  "area": 75,
  "amenities": ["wifi", "parking", "gym"],
  "landlordId": "123e4567-e89b-12d3-a456-426614174001",
  "updatedAt": "2023-06-16T10:30:00.000Z"
}
```

#### Удаление объекта

```
DELETE /properties/:id
```

**Ответ:**

```json
{
  "message": "Объект успешно удален"
}
```

### Бронирования

#### Получение списка бронирований

```
GET /bookings
```

**Параметры запроса:**

- `page` (число): номер страницы (по умолчанию 1)
- `limit` (число): количество бронирований на странице (по умолчанию 10)
- `status` (строка): статус бронирования (pending, confirmed, cancelled, completed)

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "propertyId": "123e4567-e89b-12d3-a456-426614174001",
      "property": {
        "title": "Современная квартира в центре",
        "address": "ул. Примерная, 123",
        "city": "Москва"
      },
      "checkIn": "2023-07-01T14:00:00.000Z",
      "checkOut": "2023-07-10T11:00:00.000Z",
      "guests": 2,
      "totalPrice": 15000,
      "status": "confirmed",
      "createdAt": "2023-06-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

#### Получение бронирования по ID

```
GET /bookings/:id
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "propertyId": "123e4567-e89b-12d3-a456-426614174001",
  "property": {
    "id": "123e4567-e89b-12d3-a456-426614174001",
    "title": "Современная квартира в центре",
    "address": "ул. Примерная, 123",
    "city": "Москва",
    "images": ["image1.jpg"]
  },
  "tenant": {
    "id": "123e4567-e89b-12d3-a456-426614174002",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  },
  "checkIn": "2023-07-01T14:00:00.000Z",
  "checkOut": "2023-07-10T11:00:00.000Z",
  "guests": 2,
  "totalPrice": 15000,
  "status": "confirmed",
  "paymentStatus": "paid",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Создание бронирования

```
POST /bookings
```

**Тело запроса:**

```json
{
  "propertyId": "123e4567-e89b-12d3-a456-426614174001",
  "checkIn": "2023-07-01T14:00:00.000Z",
  "checkOut": "2023-07-10T11:00:00.000Z",
  "guests": 2
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "propertyId": "123e4567-e89b-12d3-a456-426614174001",
  "tenantId": "123e4567-e89b-12d3-a456-426614174002",
  "checkIn": "2023-07-01T14:00:00.000Z",
  "checkOut": "2023-07-10T11:00:00.000Z",
  "guests": 2,
  "totalPrice": 15000,
  "status": "pending",
  "paymentStatus": "pending",
  "paymentUrl": "https://payment-gateway.com/pay/123456",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Отмена бронирования

```
PUT /bookings/:id/cancel
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "status": "cancelled",
  "cancelledAt": "2023-06-16T10:30:00.000Z"
}
```

### Избранное

#### Получение списка избранного

```
GET /favorites
```

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "property": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "title": "Современная квартира в центре",
        "price": 1500,
        "city": "Москва",
        "bedrooms": 2,
        "images": ["image1.jpg"]
      },
      "createdAt": "2023-06-15T10:30:00.000Z"
    }
  ]
}
```

#### Добавление в избранное

```
POST /favorites
```

**Тело запроса:**

```json
{
  "propertyId": "123e4567-e89b-12d3-a456-426614174001"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "123e4567-e89b-12d3-a456-426614174002",
  "propertyId": "123e4567-e89b-12d3-a456-426614174001",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Удаление из избранного

```
DELETE /favorites/:propertyId
```

**Ответ:**

```json
{
  "message": "Объект успешно удален из избранного"
}
```

### Отзывы

#### Получение отзывов об объекте

```
GET /properties/:id/reviews
```

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "rating": 5,
      "comment": "Отличная квартира!",
      "user": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2023-06-15T10:30:00.000Z"
    }
  ],
  "average": 4.8,
  "total": 10
}
```

#### Создание отзыва

```
POST /properties/:id/reviews
```

**Тело запроса:**

```json
{
  "rating": 5,
  "comment": "Отличная квартира!"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "propertyId": "123e4567-e89b-12d3-a456-426614174001",
  "userId": "123e4567-e89b-12d3-a456-426614174002",
  "rating": 5,
  "comment": "Отличная квартира!",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

### Чаты

#### Получение списка чатов

```
GET /chat
```

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "participants": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "firstName": "John",
          "lastName": "Doe",
          "role": "tenant"
        },
        {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "firstName": "Jane",
          "lastName": "Smith",
          "role": "landlord"
        }
      ],
      "lastMessage": {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "content": "Здравствуйте, я хотел бы узнать о доступности квартиры",
        "senderId": "123e4567-e89b-12d3-a456-426614174001",
        "createdAt": "2023-06-15T10:30:00.000Z"
      },
      "unreadCount": 2,
      "createdAt": "2023-06-15T10:00:00.000Z"
    }
  ]
}
```

#### Получение сообщений чата

```
GET /chat/:id/messages
```

**Параметры запроса:**

- `page` (число): номер страницы (по умолчанию 1)
- `limit` (число): количество сообщений на странице (по умолчанию 20)

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "content": "Здравствуйте, я хотел бы узнать о доступности квартиры",
      "sender": {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "firstName": "John",
        "lastName": "Doe"
      },
      "createdAt": "2023-06-15T10:30:00.000Z"
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "content": "Здравствуйте! Да, квартира доступна для бронирования",
      "sender": {
        "id": "123e4567-e89b-12d3-a456-426614174003",
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "createdAt": "2023-06-15T10:35:00.000Z"
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### Отправка сообщения

```
POST /chat/:id/messages
```

**Тело запроса:**

```json
{
  "content": "Спасибо за информацию!"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "chatId": "123e4567-e89b-12d3-a456-426614174001",
  "senderId": "123e4567-e89b-12d3-a456-426614174002",
  "content": "Спасибо за информацию!",
  "createdAt": "2023-06-15T10:40:00.000Z"
}
```

### Платежи

#### Создание платежа

```
POST /payments
```

**Тело запроса:**

```json
{
  "bookingId": "123e4567-e89b-12d3-a456-426614174000",
  "paymentMethod": "card"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "bookingId": "123e4567-e89b-12d3-a456-426614174001",
  "amount": 15000,
  "currency": "RUB",
  "status": "pending",
  "paymentUrl": "https://payment-gateway.com/pay/123456",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Получение информации о платеже

```
GET /payments/:id
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "bookingId": "123e4567-e89b-12d3-a456-426614174001",
  "amount": 15000,
  "currency": "RUB",
  "status": "completed",
  "paymentMethod": "card",
  "paidAt": "2023-06-15T10:35:00.000Z",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

### Пользователи

#### Получение профиля пользователя

```
GET /users/profile
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+7 (999) 123-45-67",
  "avatar": "avatar.jpg",
  "role": "tenant",
  "createdAt": "2023-06-15T10:30:00.000Z"
}
```

#### Обновление профиля пользователя

```
PUT /users/profile
```

**Тело запроса:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+7 (999) 123-45-67"
}
```

**Ответ:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+7 (999) 123-45-67",
  "avatar": "avatar.jpg",
  "updatedAt": "2023-06-16T10:30:00.000Z"
}
```

#### Загрузка аватара

```
POST /users/avatar
```

**Тело запроса:**

Multipart form-data с полем `avatar` (файл изображения)

**Ответ:**

```json
{
  "avatar": "avatar-123e4567.jpg",
  "url": "https://storage.example.com/avatars/avatar-123e4567.jpg"
}
```

### Администрирование

#### Получение статистики

```
GET /admin/stats
```

**Ответ:**

```json
{
  "users": {
    "total": 1000,
    "tenants": 800,
    "landlords": 200,
    "newToday": 15
  },
  "properties": {
    "total": 500,
    "active": 450,
    "pending": 50
  },
  "bookings": {
    "total": 2000,
    "pending": 100,
    "confirmed": 1800,
    "cancelled": 100,
    "revenue": 3000000
  }
}
```

#### Получение списка пользователей

```
GET /admin/users
```

**Параметры запроса:**

- `page` (число): номер страницы (по умолчанию 1)
- `limit` (число): количество пользователей на странице (по умолчанию 10)
- `role` (строка): роль пользователя (tenant, landlord, admin)
- `search` (строка): поиск по имени, фамилии или email

**Ответ:**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tenant",
      "status": "active",
      "createdAt": "2023-06-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 1000,
    "page": 1,
    "limit": 10,
    "pages": 100
  }
}
```
