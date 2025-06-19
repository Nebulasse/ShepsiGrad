# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Задаем переменные окружения для сборки
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Собираем приложение
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение из builder
COPY --from=builder /app/build /usr/share/nginx/html

# Копируем скрипт для подстановки переменных окружения во время выполнения
COPY env.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/env.sh

# Указываем порт, который будет слушать nginx
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 