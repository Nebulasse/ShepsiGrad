/**
 * Инициализация приложения
 * Этот файл запускается перед всем остальным кодом
 */

// Импортируем глобальные полифиллы
import './global-polyfills';

// Проверяем, запущено ли приложение в Hermes
const isHermes = () => !!global.HermesInternal;

// Логируем информацию о JavaScript движке
console.log(`[App] Используется ${isHermes() ? 'Hermes' : 'JSC'} JavaScript движок`);

// Если используется Hermes, применяем полифиллы
if (isHermes()) {
  try {
    // Импортируем полифиллы для Hermes
    require('./hermes-polyfill');
    console.log('[App] Полифиллы для Hermes загружены');
    
    // Импортируем исправления для Expo Router
    require('./router-fix');
    console.log('[App] Исправления для Expo Router загружены');
  } catch (err) {
    console.error('[App] Ошибка при загрузке полифиллов:', err);
  }
}

export default {
  isHermes
}; 