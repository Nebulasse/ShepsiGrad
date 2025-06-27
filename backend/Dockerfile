FROM node:16-alpine

# Создаем директорию приложения
WORKDIR /app

# Устанавливаем зависимости
COPY package*.json ./
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Создаем директорию для загрузок
RUN mkdir -p /app/uploads
RUN chmod 777 /app/uploads

# Создаем директорию для логов
RUN mkdir -p /app/logs
RUN chmod 777 /app/logs

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

# Устанавливаем права на директории
RUN chown -R nodeuser:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nodeuser

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 