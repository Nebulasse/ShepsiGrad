/**
 * Глобальные полифиллы для JSC engine
 * 
 * Этот файл добавляет полифиллы для различных глобальных объектов,
 * которые могут отсутствовать в JSC engine
 */

// Проверяем, запущено ли приложение в JSC
const isJSC = () => !global.HermesInternal;

console.log(`[Polyfill] JavaScript движок: ${isJSC() ? 'JSC' : 'Hermes'}`);

// Простые проверки без изменения глобальных объектов
if (typeof global.console === 'undefined') {
  console.warn('[Polyfill] console не найден');
}

if (typeof global.process === 'undefined') {
  console.warn('[Polyfill] process не найден');
}

if (typeof global.Error === 'undefined') {
  console.warn('[Polyfill] Error не найден');
}

if (typeof global.Blob === 'undefined') {
  console.warn('[Polyfill] Blob не найден');
}

if (typeof global.URL === 'undefined') {
  console.warn('[Polyfill] URL не найден');
}

if (typeof global.fetch === 'undefined') {
  console.warn('[Polyfill] fetch не найден');
}

console.log('[Polyfill] Полифиллы проверены'); 