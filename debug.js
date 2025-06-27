/**
 * Файл для отладки проблем с require
 */

// Проверяем наличие require
console.log('global.require exists:', typeof global.require !== 'undefined');

// Проверяем наличие HermesInternal
console.log('global.HermesInternal exists:', typeof global.HermesInternal !== 'undefined');

// Проверяем, какой движок используется
const isHermes = () => !!global.HermesInternal;
console.log('Using Hermes:', isHermes());

// Экспортируем для использования в других файлах
export default {
  isHermes
}; 