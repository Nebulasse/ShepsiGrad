# Деплой бэкенда в Kubernetes

## Подготовка

1. Убедитесь, что у вас установлен и настроен kubectl
2. Убедитесь, что у вас есть доступ к кластеру Kubernetes
3. Проверьте, что Docker образ собран и доступен в реестре

## Настройка секретов

Перед деплоем необходимо создать секреты:

```bash
# Создание секретов (значения в base64)
kubectl apply -f secrets.yaml
```

## Деплой приложения

Выполните следующие команды для деплоя:

```bash
# Применение ConfigMap
kubectl apply -f configmap.yaml

# Деплой приложения
kubectl apply -f deployment.yaml

# Создание сервиса
kubectl apply -f service.yaml

# Настройка Ingress
kubectl apply -f ingress.yaml

# Настройка мониторинга
kubectl apply -f monitoring.yaml

# Настройка автомасштабирования
kubectl apply -f hpa.yaml
```

## Проверка статуса

```bash
# Проверка статуса подов
kubectl get pods -n default -l app=rental-backend

# Проверка сервисов
kubectl get services -n default -l app=rental-backend

# Проверка Ingress
kubectl get ingress -n default

# Проверка логов
kubectl logs -n default -l app=rental-backend
```

## Масштабирование

Приложение настроено на автоматическое масштабирование, но вы можете масштабировать его вручную:

```bash
kubectl scale deployment backend -n default --replicas=3
```

## Обновление приложения

```bash
# Обновите образ в deployment.yaml и примените изменения
kubectl apply -f deployment.yaml
```
