#!/bin/bash

echo "🧪 Тестирование Docker сборки..."

# Очищаем предыдущие образы
docker rmi shepsigrad-backend:test 2>/dev/null || true

# Собираем образ
echo "📦 Сборка Docker образа..."
docker build -t shepsigrad-backend:test -f Dockerfile .

if [ $? -eq 0 ]; then
    echo "✅ Сборка успешна!"
    
    # Тестируем запуск контейнера
    echo "🚀 Тестирование запуска контейнера..."
    docker run --rm -d --name test-backend -p 3001:3000 shepsigrad-backend:test
    
    # Ждем запуска
    sleep 5
    
    # Проверяем health check
    echo "🏥 Проверка health check..."
    curl -f http://localhost:3001/health
    
    if [ $? -eq 0 ]; then
        echo "✅ Контейнер работает корректно!"
    else
        echo "❌ Health check не прошел"
    fi
    
    # Останавливаем контейнер
    docker stop test-backend
    docker rm test-backend 2>/dev/null || true
    
else
    echo "❌ Сборка не удалась"
    exit 1
fi

echo "🎉 Тестирование завершено!" 