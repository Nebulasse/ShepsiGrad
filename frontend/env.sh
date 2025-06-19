#!/bin/sh

# Получаем URL API из переменной окружения или используем значение по умолчанию
API_URL=${API_URL:-http://backend:3001}

# Подставляем значение API_URL в конфигурацию nginx
sed -i "s|\${API_URL}|${API_URL}|g" /etc/nginx/conf.d/default.conf

# Генерируем JavaScript с переменными окружения
echo "window.env = {" > /usr/share/nginx/html/env-config.js
echo "  API_URL: \"${API_URL}\"," >> /usr/share/nginx/html/env-config.js
echo "  APP_ENV: \"${APP_ENV:-production}\"," >> /usr/share/nginx/html/env-config.js
echo "  MAPBOX_TOKEN: \"${MAPBOX_TOKEN:-}\"," >> /usr/share/nginx/html/env-config.js
echo "  SENTRY_DSN: \"${SENTRY_DSN:-}\"," >> /usr/share/nginx/html/env-config.js
echo "};" >> /usr/share/nginx/html/env-config.js

# Выводим сообщение для логов
echo "Environment variables configured"

# Продолжаем выполнение docker-entrypoint.sh
exec "$@" 