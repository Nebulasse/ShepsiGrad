# Деплой ShepsiGrad Backend с Supabase

Этот документ описывает процесс деплоя backend приложения на VPS с использованием Supabase в качестве базы данных.

## Предварительные требования

1. **VPS сервер** с Ubuntu/Debian
2. **Supabase проект** с настроенной базой данных
3. **Docker** установленный локально
4. **SSH доступ** к VPS

## Быстрый деплой

### 1. Подготовка Supabase

1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и ANON KEY из настроек проекта
3. Убедитесь, что база данных настроена и таблицы созданы

### 2. Деплой на VPS

#### Для Linux/macOS:

```bash
cd backend
chmod +x deploy-vps.sh
./deploy-vps.sh YOUR_VPS_IP YOUR_SSH_USER
```

#### Для Windows:

```powershell
cd backend
.\deploy-vps.ps1 -VpsIp "YOUR_VPS_IP" -SshUser "YOUR_SSH_USER"
```

### 3. Настройка переменных окружения

После деплоя подключитесь к VPS и отредактируйте файл `.env`:

```bash
ssh YOUR_SSH_USER@YOUR_VPS_IP
cd /opt/shepsigrad-backend
nano .env
```

Обязательные настройки:

```env
# Supabase (ОБЯЗАТЕЛЬНО)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# JWT настройки
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Основные настройки
NODE_ENV=production
PORT=3000
CORS_ORIGIN=*
```

### 4. Перезапуск сервиса

```bash
cd /opt/shepsigrad-backend
docker-compose down
docker-compose up -d
```

## Проверка работоспособности

1. **Health check**: `http://YOUR_VPS_IP:3000/api/health`
2. **API endpoint**: `http://YOUR_VPS_IP:3000/api`

## Настройка домена и SSL

### 1. Настройка DNS

Добавьте A-запись для вашего домена, указывающую на IP вашего VPS.

### 2. Установка Nginx и SSL

```bash
# Установка Nginx
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Создание конфигурации
sudo nano /etc/nginx/sites-available/shepsigrad-backend
```

Конфигурация Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Активация сайта
sudo ln -s /etc/nginx/sites-available/shepsigrad-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com
```

## Обновление приложений

После деплоя обновите URL backend в ваших приложениях:

### В rental приложении:

```typescript
// services/api.ts
const API_BASE_URL = "https://your-domain.com/api";
```

### В ShepsiGradNew приложении:

```typescript
// services/api.ts
const API_BASE_URL = "https://your-domain.com/api";
```

## Мониторинг и логи

### Просмотр логов:

```bash
cd /opt/shepsigrad-backend
docker-compose logs -f backend
```

### Проверка статуса:

```bash
docker-compose ps
```

### Перезапуск сервиса:

```bash
docker-compose restart backend
```

## Опционально: MinIO для хранения файлов

Если вы хотите использовать MinIO вместо S3:

```bash
cd /opt/shepsigrad-backend
docker-compose --profile storage up -d
```

Затем обновите `.env`:

```env
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_BUCKET=rental-app
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

## Устранение неполадок

### Проблема: Backend не запускается

```bash
# Проверка логов
docker-compose logs backend

# Проверка переменных окружения
docker-compose exec backend env | grep SUPABASE
```

### Проблема: Нет доступа к API

1. Проверьте firewall: `sudo ufw status`
2. Откройте порт 3000: `sudo ufw allow 3000`
3. Проверьте CORS настройки в `.env`

### Проблема: Ошибки подключения к Supabase

1. Проверьте правильность SUPABASE_URL и SUPABASE_ANON_KEY
2. Убедитесь, что IP вашего VPS добавлен в allowlist в Supabase
3. Проверьте настройки RLS (Row Level Security) в Supabase

## Автоматическое обновление

Для автоматического обновления при изменении кода:

```bash
# Создание скрипта обновления
nano /opt/shepsigrad-backend/update.sh
```

```bash
#!/bin/bash
cd /opt/shepsigrad-backend
docker-compose pull
docker-compose up -d
```

```bash
chmod +x /opt/shepsigrad-backend/update.sh
```

## Резервное копирование

### Резервное копирование конфигурации:

```bash
tar -czf backup-$(date +%Y%m%d).tar.gz /opt/shepsigrad-backend/.env /opt/shepsigrad-backend/docker-compose.yml
```

### Резервное копирование данных:

Данные хранятся в Supabase, поэтому резервное копирование не требуется.
