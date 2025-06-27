#!/bin/bash

# Скрипт для деплоя минимальной версии бэкенда

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Начало деплоя минимальной версии бэкенда...${NC}"

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Установите Docker и повторите попытку.${NC}"
    exit 1
fi

# Проверка наличия kubectl
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl не установлен. Установите kubectl и повторите попытку.${NC}"
    exit 1
fi

# Сборка Docker-образа
echo -e "${YELLOW}Сборка Docker-образа...${NC}"
docker build -f Dockerfile.minimal -t rental-backend-minimal:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке Docker-образа.${NC}"
    exit 1
fi

echo -e "${GREEN}Docker-образ успешно собран.${NC}"

# Проверка, запущен ли minikube
if command -v minikube &> /dev/null; then
    if ! minikube status | grep -q "Running"; then
        echo -e "${YELLOW}Запуск minikube...${NC}"
        minikube start
    fi
    
    # Загрузка образа в minikube
    echo -e "${YELLOW}Загрузка образа в minikube...${NC}"
    minikube image load rental-backend-minimal:latest
fi

# Создание namespace, если не существует
echo -e "${YELLOW}Проверка namespace...${NC}"
kubectl get namespace dev || kubectl create namespace dev

# Применение манифестов Kubernetes
echo -e "${YELLOW}Применение манифестов Kubernetes...${NC}"
kubectl apply -f kubernetes/dev/minimal-deployment.yaml
kubectl apply -f kubernetes/dev/minimal-service.yaml
kubectl apply -f kubernetes/dev/minimal-ingress.yaml

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при применении манифестов Kubernetes.${NC}"
    exit 1
fi

echo -e "${GREEN}Манифесты Kubernetes успешно применены.${NC}"

# Проверка статуса деплоя
echo -e "${YELLOW}Проверка статуса деплоя...${NC}"
kubectl rollout status deployment/rental-backend-minimal -n dev

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при деплое.${NC}"
    exit 1
fi

echo -e "${GREEN}Деплой успешно завершен.${NC}"

# Получение URL для доступа к сервису
if command -v minikube &> /dev/null; then
    echo -e "${YELLOW}URL для доступа к сервису:${NC}"
    echo -e "${GREEN}$(minikube service rental-backend-minimal-service -n dev --url)${NC}"
else
    echo -e "${YELLOW}Для доступа к сервису настройте DNS запись api-dev.rentalapp.com или добавьте запись в /etc/hosts${NC}"
fi

echo -e "${GREEN}Деплой минимальной версии бэкенда успешно завершен!${NC}" 