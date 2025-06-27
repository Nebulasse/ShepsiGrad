/**
 * Полифилл для Hermes
 * Решает проблему с отсутствием require в Hermes
 */

// Создаем кэш для модулей
const moduleCache = {};

// Проверяем, существует ли глобальный объект require
if (typeof global.require === 'undefined') {
  console.log('[Hermes Polyfill] Создаем полифилл для require');
  
  // Создаем заглушку для require
  global.require = function hermesRequire(id) {
    // Проверяем, есть ли модуль в кэше
    if (moduleCache[id]) {
      return moduleCache[id];
    }
    
    // Для изображений и других ресурсов
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
    
    // Специальная обработка для некоторых модулей
    if (id === 'react' && global.React) {
      return global.React;
    }
    
    if (id === 'react-native' && global.ReactNative) {
      return global.ReactNative;
    }
    
    // Для всех остальных случаев
    console.warn(`[Hermes Polyfill] Попытка использовать require('${id}') в Hermes`);
    const emptyModule = {};
    moduleCache[id] = emptyModule;
    return emptyModule;
  };
  
  // Добавляем необходимые свойства
  global.require.resolve = function(id) {
    return id;
  };
  
  global.require.cache = moduleCache;
  global.require.main = { exports: {} };
  global.require.extensions = {};
  
  // Добавляем поддержку для модульной системы
  global.module = global.module || { exports: {} };
  global.exports = global.exports || {};
}

// Проверяем, существует ли глобальный объект process
if (typeof global.process === 'undefined') {
  console.log('[Hermes Polyfill] Создаем полифилл для process');
  
  global.process = {
    env: {},
    nextTick: function(callback) {
      setTimeout(callback, 0);
    },
    platform: 'react-native',
    version: '',
    browser: false,
    cwd: function() { return '/' },
    argv: []
  };
} else if (typeof global.process.env === 'undefined') {
  global.process.env = {};
}

export default {}; 