/**
 * Инициализатор для веб-версии приложения
 * 
 * Этот файл содержит настройки и полифиллы для веб-версии приложения
 */

import { Platform } from 'react-native';

// Выполняем инициализацию только для веб-платформы
if (Platform.OS === 'web') {
  // Проверяем, запущено ли приложение в браузере
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Устанавливаем стили для body и root элемента
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    document.body.style.backgroundColor = '#F8F9FA';
    
    // Находим корневой элемент
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100%';
      rootElement.style.width = '100%';
      rootElement.style.display = 'flex';
      rootElement.style.flexDirection = 'column';
    }
    
    // Добавляем мета-теги для мобильных устройств
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no';
    document.head.appendChild(meta);
    
    // Добавляем стили для исправления проблем с тенями
    const style = document.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      
      /* Исправление для shadow* свойств */
      [style*="shadow"] {
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1) !important;
      }
    `;
    document.head.appendChild(style);
    
    console.log('Web initializer установлен');
  }
} 