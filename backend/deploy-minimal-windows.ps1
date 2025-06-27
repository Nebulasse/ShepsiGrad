# PowerShell скрипт для деплоя минимальной версии бэкенда на Windows

# Цвета для вывода
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "Начало деплоя минимальной версии бэкенда..." -ForegroundColor $Yellow

# Проверка наличия Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js версия: $nodeVersion" -ForegroundColor $Green
} catch {
    Write-Host "Node.js не установлен. Установите Node.js и повторите попытку." -ForegroundColor $Red
    exit 1
}

# Запуск сервера
Write-Host "Запуск минимального сервера..." -ForegroundColor $Yellow

# Проверка, не запущен ли уже сервер
$processInfo = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($processInfo) {
    Write-Host "Порт 3000 уже используется. Возможно, сервер уже запущен." -ForegroundColor $Yellow
    
    # Спрашиваем, хочет ли пользователь остановить текущий процесс
    $answer = Read-Host "Хотите остановить текущий процесс и запустить новый сервер? (y/n)"
    if ($answer -eq "y") {
        $processId = $processInfo.OwningProcess
        Stop-Process -Id $processId -Force
        Write-Host "Процесс остановлен." -ForegroundColor $Green
    } else {
        Write-Host "Деплой отменен. Используйте текущий запущенный сервер." -ForegroundColor $Yellow
        exit 0
    }
}

# Запуск сервера в фоновом режиме
Start-Process -FilePath "node" -ArgumentList "src/server-minimal.js" -NoNewWindow

# Проверка, запустился ли сервер
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Сервер успешно запущен!" -ForegroundColor $Green
        Write-Host "Доступен по адресу: http://localhost:3000" -ForegroundColor $Green
        
        # Вывод доступных эндпоинтов
        Write-Host "`nДоступные эндпоинты:" -ForegroundColor $Yellow
        Write-Host "  GET  /api/health - проверка работоспособности" -ForegroundColor $Green
        Write-Host "  GET  /api/users - список пользователей" -ForegroundColor $Green
        Write-Host "  POST /api/auth/login - вход в систему" -ForegroundColor $Green
        Write-Host "  POST /api/auth/register - регистрация" -ForegroundColor $Green
        
        # Проверка работоспособности эндпоинта входа
        Write-Host "`nПроверка эндпоинта входа:" -ForegroundColor $Yellow
        $loginBody = @{
            email = "test@example.com"
            password = "password"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 5
            Write-Host "Эндпоинт входа работает корректно (код: $($loginResponse.StatusCode))" -ForegroundColor $Green
        } catch {
            Write-Host "Ошибка при проверке эндпоинта входа: $_" -ForegroundColor $Red
        }
    } else {
        Write-Host "Сервер запущен, но возвращает неожиданный статус: $($response.StatusCode)" -ForegroundColor $Yellow
    }
} catch {
    Write-Host "Не удалось подключиться к серверу: $_" -ForegroundColor $Red
    exit 1
}

Write-Host "`nДеплой минимальной версии бэкенда успешно завершен!" -ForegroundColor $Green
Write-Host "Для остановки сервера используйте диспетчер задач или команду:" -ForegroundColor $Yellow
Write-Host "Get-Process -Name 'node' | Where-Object {`$_.CommandLine -like '*server-minimal.js*'} | Stop-Process" -ForegroundColor $Green 