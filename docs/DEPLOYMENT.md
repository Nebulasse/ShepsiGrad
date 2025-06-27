# Руководство по развертыванию

Это руководство описывает процесс развертывания приложения ShepsiGrad в различных окружениях.

## Содержание

1. [Требования](#требования)
2. [Текущий статус проекта](#текущий-статус-проекта)
3. [Локальное развертывание](#локальное-развертывание)
4. [Развертывание с Docker](#развертывание-с-docker)
5. [Развертывание в Kubernetes](#развертывание-в-kubernetes)
6. [CI/CD](#cicd)
7. [Мониторинг](#мониторинг)

## Требования

Для успешного развертывания необходимо:

- Node.js 16.x или выше
- PostgreSQL 14.x
- Redis 7.x
- Docker и Docker Compose (для контейнеризации)
- Kubernetes (для оркестрации контейнеров)
- Доступ к хранилищу S3 (MinIO или AWS S3)

## Текущий статус проекта

На данный момент проект находится в стадии подготовки к деплою. Выполнены следующие шаги:

- ✅ Создана базовая структура проекта
- ✅ Настроены основные API эндпоинты
- ✅ Реализована аутентификация и авторизация
- ✅ Настроен WebSocket для чатов и уведомлений
- ✅ Созданы файлы конфигурации для Docker и Kubernetes
- ✅ Настроена система мониторинга (Prometheus и Grafana)
- ✅ Создана документация API

Необходимо выполнить следующие шаги перед деплоем:

1. **Исправить ошибки TypeScript** - в проекте имеется около 269 ошибок типизации, которые необходимо исправить
2. **Исправить тесты** - из 5 тестов проходит только 1 (socketConnection.test.ts)
3. **Настроить переменные окружения** - создать правильные .env файлы для разных окружений
4. **Исправить модели данных** - некоторые модели имеют несоответствия в типах
5. **Обновить функцию логирования** - исправить getModuleLogger
6. **Настроить подключение к базе данных** - проверить и исправить конфигурацию

Приоритетные файлы для исправления:

- src/utils/logger.ts
- src/database/connection.ts
- src/models/\*.ts
- src/middleware/auth.middleware.ts
- src/controllers/\*.ts

## Локальное развертывание

### Настройка окружения

1. Скопируйте файл `.env.example` в `.env`:

```bash
cp .env.example .env
```

2. Отредактируйте `.env` файл, указав необходимые параметры.

### Установка зависимостей

```bash
npm install
```

### Миграция базы данных

```bash
npm run migrate
```

### Запуск приложения

Для разработки:

```bash
npm run dev
```

Для продакшн:

```bash
npm run build
npm start
```

## Развертывание с Docker

### Сборка образа

```bash
docker build -t shepsigrad-backend .
```

### Запуск с Docker Compose

```bash
docker-compose up -d
```

Это запустит:

- Backend API
- PostgreSQL
- Redis
- MinIO (S3-совместимое хранилище)

### Остановка контейнеров

```bash
docker-compose down
```

## Развертывание в Kubernetes

### Предварительные требования

- Настроенный кластер Kubernetes
- Установленный kubectl
- Настроенный контекст kubectl

### Развертывание в Dev окружении

```bash
kubectl apply -f kubernetes/dev/
```

### Развертывание в Prod окружении

```bash
kubectl apply -f kubernetes/prod/
```

### Проверка статуса развертывания

```bash
kubectl get pods -n shepsigrad-dev
kubectl get services -n shepsigrad-dev
kubectl get ingress -n shepsigrad-dev
```

### Обновление развертывания

```bash
kubectl set image deployment/shepsigrad-backend shepsigrad-backend=yourusername/shepsigrad-backend:latest -n shepsigrad-dev
```

### Просмотр логов

```bash
kubectl logs deployment/shepsigrad-backend -n shepsigrad-dev
```

## CI/CD

Проект настроен на использование GitHub Actions для непрерывной интеграции и развертывания.

### Настройка GitHub Actions

1. Добавьте следующие секреты в настройки репозитория GitHub:

   - `DOCKERHUB_USERNAME`: имя пользователя Docker Hub
   - `DOCKERHUB_TOKEN`: токен доступа Docker Hub
   - `KUBE_CONFIG_DEV`: конфигурация kubectl для dev окружения
   - `KUBE_CONFIG_PROD`: конфигурация kubectl для prod окружения

2. Пуш в ветку `develop` автоматически запустит тесты и деплой в dev окружение.
3. Пуш в ветку `main` автоматически запустит тесты и деплой в prod окружение.

## Мониторинг

Для мониторинга приложения используются Prometheus и Grafana.

### Доступ к мониторингу

- Grafana: https://monitoring.shepsigrad.dev
- Prometheus: https://monitoring.shepsigrad.dev/prometheus

### Основные метрики

- Использование CPU и памяти
- Количество запросов в секунду
- Время ответа API
- Ошибки и исключения

### Оповещения

Настроены оповещения при:

- Высокой загрузке CPU (> 80%)
- Высоком использовании памяти (> 80%)
- Большом количестве ошибок (> 5% от всех запросов)
- Недоступности сервиса (> 1 минуты)
