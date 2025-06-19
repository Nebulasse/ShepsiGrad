# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /app

# Устанавливаем зависимости только для production
COPY package*.json ./
RUN npm ci --only=production

# Копируем собранное приложение из builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Указываем порт, который будет слушать приложение
EXPOSE 3001

# Устанавливаем переменные окружения для production
ENV NODE_ENV=production

# Запускаем приложение
CMD ["node", "dist/index.js"] 