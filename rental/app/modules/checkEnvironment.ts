/**
 * Проверка окружения
 * 
 * Этот файл проверяет окружение и выводит информацию о нем
 */

// Проверяем, запущено ли приложение в Hermes
export const isHermes = () => !!global.HermesInternal;

// Проверяем наличие require
export const hasRequire = () => typeof global.require !== 'undefined';

// Проверяем наличие process
export const hasProcess = () => typeof global.process !== 'undefined';

// Проверяем наличие process.env
export const hasProcessEnv = () => typeof global.process?.env !== 'undefined';

// Выводим информацию об окружении
export const logEnvironmentInfo = () => {
  console.log('===== Информация об окружении =====');
  console.log(`JavaScript движок: ${isHermes() ? 'Hermes' : 'JSC'}`);
  console.log(`global.require доступен: ${hasRequire() ? 'Да' : 'Нет'}`);
  console.log(`global.process доступен: ${hasProcess() ? 'Да' : 'Нет'}`);
  console.log(`global.process.env доступен: ${hasProcessEnv() ? 'Да' : 'Нет'}`);
  console.log('==================================');
};

// Запускаем проверку при импорте модуля
logEnvironmentInfo(); 