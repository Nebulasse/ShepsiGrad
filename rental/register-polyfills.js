/**
 * Регистрация полифиллов в глобальном объекте
 */

// Проверяем, запущено ли приложение в Hermes
const isHermes = () => !!global.HermesInternal;

// Выводим информацию о JavaScript движке
console.log(`[Polyfill] Используется ${isHermes() ? 'Hermes' : 'JSC'} JavaScript движок`);

// Регистрируем require в глобальном объекте
if (typeof global.require === 'undefined') {
  // Создаем кэш для модулей
  const moduleCache = {};
  
  // Создаем функцию require
  global.require = function(id) {
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
  
  console.log('[Polyfill] global.require зарегистрирован');
}

// Регистрируем process в глобальном объекте
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    nextTick: function(callback) { setTimeout(callback, 0); },
    platform: 'react-native',
    version: ''
  };
  
  console.log('[Polyfill] global.process зарегистрирован');
} else if (typeof global.process.env === 'undefined') {
  global.process.env = {};
  console.log('[Polyfill] global.process.env зарегистрирован');
}

// Проверяем наличие require после регистрации
console.log(`[Polyfill] global.require ${typeof global.require !== 'undefined' ? 'доступен' : 'недоступен'}`);
console.log(`[Polyfill] global.process ${typeof global.process !== 'undefined' ? 'доступен' : 'недоступен'}`);

// Экспортируем для возможного использования
module.exports = {
  isHermes,
  hasRequire: () => typeof global.require !== 'undefined',
  hasProcess: () => typeof global.process !== 'undefined'
}; 