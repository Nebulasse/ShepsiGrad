# Скрипт для деплоя backend на VPS (с Supabase)
# Использование: .\deploy-vps.ps1 -VpsIp "192.168.1.100" -SshUser "root"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIp,
    
    [Parameter(Mandatory=$true)]
    [string]$SshUser
)

# Цвета для вывода
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Blue = "Blue"

$RemoteDir = "/opt/shepsigrad-backend"
$DockerImage = "shepsigrad-backend:latest"

Write-Host "=== Деплой ShepsiGrad Backend на VPS (с Supabase) ===" -ForegroundColor $Blue
Write-Host "VPS IP: $VpsIp" -ForegroundColor $Yellow
Write-Host "SSH User: $SshUser" -ForegroundColor $Yellow
Write-Host "Remote Directory: $RemoteDir" -ForegroundColor $Yellow

# Проверка наличия Docker
try {
    docker --version | Out-Null
} catch {
    Write-Host "Docker не установлен локально. Установите Docker и повторите попытку." -ForegroundColor $Red
    exit 1
}

# Сборка Docker образа
Write-Host "Сборка Docker образа..." -ForegroundColor $Yellow
try {
    docker build -t $DockerImage .
    if ($LASTEXITCODE -ne 0) {
        throw "Ошибка при сборке Docker образа"
    }
} catch {
    Write-Host "Ошибка при сборке Docker образа: $_" -ForegroundColor $Red
    exit 1
}

Write-Host "Docker образ успешно собран." -ForegroundColor $Green

# Сохранение образа в tar файл
Write-Host "Сохранение Docker образа..." -ForegroundColor $Yellow
docker save $DockerImage | gzip > shepsigrad-backend.tar.gz

# Создание директории на VPS
Write-Host "Создание директории на VPS..." -ForegroundColor $Yellow
ssh "${SshUser}@${VpsIp}" "sudo mkdir -p ${RemoteDir} && sudo chown ${SshUser}:${SshUser} ${RemoteDir}"

# Копирование файлов на VPS
Write-Host "Копирование файлов на VPS..." -ForegroundColor $Yellow
scp shepsigrad-backend.tar.gz "${SshUser}@${VpsIp}:${RemoteDir}/"
scp docker-compose.supabase.yml "${SshUser}@${VpsIp}:${RemoteDir}/docker-compose.yml"
scp env.example "${SshUser}@${VpsIp}:${RemoteDir}/"

# Настройка на VPS
Write-Host "Настройка на VPS..." -ForegroundColor $Yellow
$setupScript = @"
cd ${RemoteDir}

# Проверка наличия Docker на VPS
if ! command -v docker &> /dev/null; then
    echo "Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ${SshUser}
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
    echo "ВАЖНО: Отредактируйте файл .env с вашими настройками Supabase!"
fi

# Остановка существующих контейнеров
echo "Остановка существующих контейнеров..."
docker-compose down || true

# Запуск новых контейнеров
echo "Запуск контейнеров..."
docker-compose up -d

# Очистка
rm shepsigrad-backend.tar.gz
"@

ssh "${SshUser}@${VpsIp}" $setupScript

# Проверка статуса
Write-Host "Проверка статуса сервисов..." -ForegroundColor $Yellow
ssh "${SshUser}@${VpsIp}" "cd ${RemoteDir} && docker-compose ps"

# Итоговая информация
Write-Host "=== Деплой завершен! ===" -ForegroundColor $Green
Write-Host "Backend доступен по адресу: http://${VpsIp}:3000" -ForegroundColor $Blue
Write-Host "API endpoint: http://${VpsIp}:3000/api" -ForegroundColor $Blue
Write-Host "Health check: http://${VpsIp}:3000/api/health" -ForegroundColor $Blue
Write-Host "ВАЖНО:" -ForegroundColor $Yellow
Write-Host "1. Отредактируйте .env файл на VPS и добавьте ваши Supabase настройки" -ForegroundColor $Yellow
Write-Host "2. Настройте firewall (откройте порт 3000)" -ForegroundColor $Yellow
Write-Host "3. Настройте домен и SSL сертификат" -ForegroundColor $Yellow
Write-Host "4. Обновите URL в ваших приложениях rental и ShepsiGradNew" -ForegroundColor $Yellow
Write-Host "5. Для MinIO (опционально): docker-compose --profile storage up -d" -ForegroundColor $Yellow

# Очистка локальных файлов
Remove-Item -Path "shepsigrad-backend.tar.gz" -Force -ErrorAction SilentlyContinue

Write-Host "Деплой успешно завершен!" -ForegroundColor $Green 