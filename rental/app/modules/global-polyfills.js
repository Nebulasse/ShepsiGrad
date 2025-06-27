/**
 * Глобальные полифиллы для JSC
 * 
 * Этот файл обеспечивает совместимость с JSC движком
 */

// Полифилл для process
if (typeof global.process === 'undefined') {
  global.process = {
    env: {},
    platform: 'react-native',
    version: '',
    versions: {},
    nextTick: (fn) => setTimeout(fn, 0),
  };
}

// Полифилл для Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
}

// Полифилл для __dirname и __filename
if (typeof global.__dirname === 'undefined') {
  global.__dirname = '/';
}

if (typeof global.__filename === 'undefined') {
  global.__filename = '/index.js';
}

// Полифилл для console (если не определен)
if (typeof global.console === 'undefined') {
  global.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  };
}

// Полифилл для setTimeout и setInterval
if (typeof global.setTimeout === 'undefined') {
  global.setTimeout = (fn, delay) => {
    // Простая реализация
    return setTimeout(fn, delay);
  };
}

if (typeof global.setInterval === 'undefined') {
  global.setInterval = (fn, delay) => {
    // Простая реализация
    return setInterval(fn, delay);
  };
}

// Полифилл для clearTimeout и clearInterval
if (typeof global.clearTimeout === 'undefined') {
  global.clearTimeout = (id) => {
    clearTimeout(id);
  };
}

if (typeof global.clearInterval === 'undefined') {
  global.clearInterval = (id) => {
    clearInterval(id);
  };
}

console.log('[Polyfills] Глобальные полифиллы загружены'); 