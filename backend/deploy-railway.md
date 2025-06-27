# 🚀 Деплой на Railway

## Быстрый деплой backend на Railway

### Шаг 1: Подготовка

1. **Убедитесь, что у вас есть:**

   - GitHub аккаунт
   - Supabase проект с URL и ANON KEY

2. **Закоммитьте изменения в Git:**
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push
   ```

### Шаг 2: Деплой на Railway

1. **Перейдите на [railway.app](https://railway.app)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите "Deploy from GitHub repo"**
5. **Выберите ваш репозиторий с backend**
6. **Railway автоматически определит Node.js проект**

### Шаг 3: Настройка переменных окружения

В Railway Dashboard:

1. **Перейдите в раздел "Variables"**
2. **Добавьте переменные:**

```env
NODE_ENV=production
PORT=3000
API_PREFIX=/api
CORS_ORIGIN=*

# Supabase (ОБЯЗАТЕЛЬНО)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT настройки
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Хранилище файлов
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads

# Логирование
LOG_LEVEL=info
```

### Шаг 4: Получение URL

После деплоя Railway даст вам URL вида:

```
https://your-app-name.railway.app
```

### Шаг 5: Обновление приложений

Обновите URL backend в ваших приложениях:

**В rental приложении:**

```typescript
// services/api.ts
const API_BASE_URL = "https://your-app-name.railway.app/api";
```

**В ShepsiGradNew приложении:**

```typescript
// services/api.ts
const API_BASE_URL = "https://your-app-name.railway.app/api";
```

## Преимущества Railway

✅ **Автоматический деплой** при push в GitHub  
✅ **SSL сертификат** включен  
✅ **Глобальный CDN**  
✅ **Автоматическое масштабирование**  
✅ **Мониторинг и логи**  
✅ **Бесплатный план** (до 500 часов/месяц)

## Проверка работоспособности

1. **Health check:** `https://your-app-name.railway.app/health`
2. **API endpoint:** `https://your-app-name.railway.app/api`

## Обновления

Просто делайте push в GitHub — Railway автоматически передеплоит приложение!

## Устранение неполадок

### Проблема: Build failed - npm run build

**Решение:** Проблема была в конфликтующих файлах TypeScript в папке `_old`.

**Что было исправлено:**

- ✅ Обновлен `tsconfig.json` для исключения проблемных файлов
- ✅ Создан `.dockerignore` для исключения ненужных файлов
- ✅ Перемещена папка `_old` в `_old_backup`
- ✅ Обновлены Dockerfile'ы для более надежной сборки

**Для локального тестирования:**

```bash
cd backend
npm run build  # Должно работать без ошибок
```

### Проблема: App not starting

- Проверьте переменные окружения
- Убедитесь, что SUPABASE_URL и SUPABASE_ANON_KEY правильные

### Проблема: CORS errors

- Проверьте CORS_ORIGIN в переменных окружения
- Добавьте домены ваших приложений

## Альтернативные Dockerfile'ы

Если основной Dockerfile не работает, попробуйте:

1. **Dockerfile.minimal** - минимальная версия для быстрого деплоя
2. **Dockerfile.dev** - версия для разработки

## Локальное тестирование Docker

```bash
# Тестирование сборки
docker build -t shepsigrad-backend:test .

# Тестирование запуска
docker run -p 3001:3000 shepsigrad-backend:test

# Проверка health check
curl http://localhost:3001/health
```
