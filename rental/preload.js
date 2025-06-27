/**
 * Предзагрузка полифиллов
 * Этот файл запускается перед основным приложением
 */

// Создаем глобальный require, если его нет
if (typeof global.require === 'undefined') {
  // Создаем кэш для модулей
  const moduleCache = {};
  
  // Создаем базовую функцию require
  global.require = function(id) {
    console.log(`[Polyfill] Вызов require('${id}')`);
    
    // Проверяем кэш
    if (moduleCache[id]) {
      return moduleCache[id];
    }
    
    // Для изображений
    if (id.match(/\.(png|jpg|jpeg|gif|webp|svg|ttf|otf|woff|woff2)$/)) {
      const result = { uri: id };
      moduleCache[id] = result;
      return result;
    }
    
    // Для JSON файлов
    if (id.endsWith('.json')) {
      const result = { default: {} };
      moduleCache[id] = result;
      return result;
    }
    
    // Заглушка для всех остальных случаев
    const emptyModule = {};
    moduleCache[id] = emptyModule;
    return emptyModule;
  };
  
  // Добавляем свойства к require
  global.require.resolve = function(id) { return id; };
  global.require.cache = moduleCache;
  global.require.main = { exports: {} };
  global.require.extensions = {};
  
  console.log('[Polyfill] global.require создан');
}

// Создаем process, если его нет
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: function(callback) { setTimeout(callback, 0); },
    platform: 'react-native',
    version: ''
  };
  
  console.log('[Polyfill] global.process создан');
} else if (typeof global.process.env === 'undefined') {
  global.process.env = {};
  console.log('[Polyfill] global.process.env создан');
}

// Экспортируем для возможного использования
module.exports = {
  isHermes: () => !!global.HermesInternal
}; 