FROM node:18-alpine

# Создаем директорию приложения
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production=false

# Копируем исходный код
COPY . .

# Компилируем TypeScript в JavaScript
RUN npm run build

# Удаляем dev-зависимости
RUN npm prune --production

# Создаем директории
RUN mkdir -p /app/uploads /app/logs && \
    chmod 777 /app/uploads /app/logs

# Создаем непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app

# Переключаемся на непривилегированного пользователя
USER nodeuser

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 