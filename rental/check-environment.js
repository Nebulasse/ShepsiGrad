/**
 * Проверка окружения
 * Выводит информацию о текущем окружении JavaScript
 */

// Проверяем, запущено ли приложение в Hermes
const isHermes = () => !!global.HermesInternal;

// Проверяем наличие require
const hasRequire = () => typeof global.require !== 'undefined';

// Проверяем наличие process
const hasProcess = () => typeof global.process !== 'undefined';

// Проверяем наличие process.env
const hasProcessEnv = () => typeof global.process?.env !== 'undefined';

// Выводим информацию об окружении
console.log('===== ИНФОРМАЦИЯ ОБ ОКРУЖЕНИИ =====');
console.log(`JavaScript движок: ${isHermes() ? 'Hermes' : 'JSC'}`);
console.log(`global.require доступен: ${hasRequire() ? 'Да' : 'Нет'}`);
console.log(`global.process доступен: ${hasProcess() ? 'Да' : 'Нет'}`);
console.log(`global.process.env доступен: ${hasProcessEnv() ? 'Да' : 'Нет'}`);

// Проверяем наличие глобальных объектов
console.log('\n===== ГЛОБАЛЬНЫЕ ОБЪЕКТЫ =====');
console.log('global.React:', typeof global.React !== 'undefined' ? 'Доступен' : 'Недоступен');
console.log('global.ReactNative:', typeof global.ReactNative !== 'undefined' ? 'Доступен' : 'Недоступен');

// Если require доступен, проверяем его свойства
if (hasRequire()) {
  console.log('\n===== СВОЙСТВА REQUIRE =====');
  console.log('global.require.resolve:', typeof global.require.resolve !== 'undefined' ? 'Доступен' : 'Недоступен');
  console.log('global.require.cache:', typeof global.require.cache !== 'undefined' ? 'Доступен' : 'Недоступен');
  console.log('global.require.main:', typeof global.require.main !== 'undefined' ? 'Доступен' : 'Недоступен');
  console.log('global.require.extensions:', typeof global.require.extensions !== 'undefined' ? 'Доступен' : 'Недоступен');
}

// Если require недоступен, создаем его
if (!hasRequire()) {
  console.log('\n===== СОЗДАНИЕ REQUIRE =====');
  global.require = function(id) {
    console.log(`[CHECK] Вызов require('${id}')`);
    return {};
  };
  global.require.resolve = function(id) { return id; };
  global.require.cache = {};
  global.require.main = { exports: {} };
  global.require.extensions = {};
  console.log('global.require создан');
}

// Если process недоступен, создаем его
if (!hasProcess()) {
  console.log('\n===== СОЗДАНИЕ PROCESS =====');
  global.process = {
    env: {},
    nextTick: function(callback) { setTimeout(callback, 0); },
    platform: 'react-native',
    version: ''
  };
  console.log('global.process создан');
} else if (!hasProcessEnv()) {
  global.process.env = {};
  console.log('global.process.env создан');
}

console.log('\n===== ПРОВЕРКА ПОСЛЕ СОЗДАНИЯ =====');
console.log(`global.require доступен: ${typeof global.require !== 'undefined' ? 'Да' : 'Нет'}`);
console.log(`global.process доступен: ${typeof global.process !== 'undefined' ? 'Да' : 'Нет'}`);
console.log('==================================='); 