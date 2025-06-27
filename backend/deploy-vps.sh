#!/bin/bash

# Скрипт для деплоя backend на VPS (с Supabase)
# Использование: ./deploy-vps.sh [VPS_IP] [SSH_USER]

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ $# -lt 2 ]; then
    echo -e "${RED}Использование: $0 <VPS_IP> <SSH_USER>${NC}"
    echo -e "${YELLOW}Пример: $0 192.168.1.100 root${NC}"
    exit 1
fi

VPS_IP=$1
SSH_USER=$2
REMOTE_DIR="/opt/shepsigrad-backend"
DOCKER_IMAGE="shepsigrad-backend:latest"

echo -e "${BLUE}=== Деплой ShepsiGrad Backend на VPS (с Supabase) ===${NC}"
echo -e "${YELLOW}VPS IP: ${VPS_IP}${NC}"
echo -e "${YELLOW}SSH User: ${SSH_USER}${NC}"
echo -e "${YELLOW}Remote Directory: ${REMOTE_DIR}${NC}"

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен локально. Установите Docker и повторите попытку.${NC}"
    exit 1
fi

# Сборка Docker образа
echo -e "${YELLOW}Сборка Docker образа...${NC}"
docker build -t ${DOCKER_IMAGE} .

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сборке Docker образа.${NC}"
    exit 1
fi

echo -e "${GREEN}Docker образ успешно собран.${NC}"

# Сохранение образа в tar файл
echo -e "${YELLOW}Сохранение Docker образа...${NC}"
docker save ${DOCKER_IMAGE} | gzip > shepsigrad-backend.tar.gz

# Создание директории на VPS
echo -e "${YELLOW}Создание директории на VPS...${NC}"
ssh ${SSH_USER}@${VPS_IP} "sudo mkdir -p ${REMOTE_DIR} && sudo chown ${SSH_USER}:${SSH_USER} ${REMOTE_DIR}"

# Копирование файлов на VPS
echo -e "${YELLOW}Копирование файлов на VPS...${NC}"
scp shepsigrad-backend.tar.gz ${SSH_USER}@${VPS_IP}:${REMOTE_DIR}/
scp docker-compose.supabase.yml ${SSH_USER}@${VPS_IP}:${REMOTE_DIR}/docker-compose.yml
scp env.example ${SSH_USER}@${VPS_IP}:${REMOTE_DIR}/

# Настройка на VPS
echo -e "${YELLOW}Настройка на VPS...${NC}"
ssh ${SSH_USER}@${VPS_IP} << EOF
    cd ${REMOTE_DIR}
    
    # Проверка наличия Docker на VPS
    if ! command -v docker &> /dev/null; then
        echo "Установка Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker ${SSH_USER}
        rm get-docker.sh
    fi
    
    # Проверка наличия Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo "Установка Docker Compose..."
        sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    # Загрузка Docker образа
    echo "Загрузка Docker образа..."
    docker load < shepsigrad-backend.tar.gz
    
    # Создание .env файла если не существует
    if [ ! -f .env ]; then
        echo "Создание .env файла из примера..."
        cp env.example .env
        echo -e "${YELLOW}ВАЖНО: Отредактируйте файл .env с вашими настройками Supabase!${NC}"
    fi
    
    # Остановка существующих контейнеров
    echo "Остановка существующих контейнеров..."
    docker-compose down || true
    
    # Запуск новых контейнеров
    echo "Запуск контейнеров..."
    docker-compose up -d
    
    # Очистка
    rm shepsigrad-backend.tar.gz
EOF

# Проверка статуса
echo -e "${YELLOW}Проверка статуса сервисов...${NC}"
ssh ${SSH_USER}@${VPS_IP} "cd ${REMOTE_DIR} && docker-compose ps"

# Получение IP адреса VPS
echo -e "${GREEN}=== Деплой завершен! ===${NC}"
echo -e "${BLUE}Backend доступен по адресу: http://${VPS_IP}:3000${NC}"
echo -e "${BLUE}API endpoint: http://${VPS_IP}:3000/api${NC}"
echo -e "${BLUE}Health check: http://${VPS_IP}:3000/api/health${NC}"
echo -e "${YELLOW}ВАЖНО:${NC}"
echo -e "${YELLOW}1. Отредактируйте .env файл на VPS и добавьте ваши Supabase настройки${NC}"
echo -e "${YELLOW}2. Настройте firewall (откройте порт 3000)${NC}"
echo -e "${YELLOW}3. Настройте домен и SSL сертификат${NC}"
echo -e "${YELLOW}4. Обновите URL в ваших приложениях rental и ShepsiGradNew${NC}"
echo -e "${YELLOW}5. Для MinIO (опционально): docker-compose --profile storage up -d${NC}"

# Очистка локальных файлов
rm -f shepsigrad-backend.tar.gz

echo -e "${GREEN}Деплой успешно завершен!${NC}" 