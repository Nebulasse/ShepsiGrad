/**
 * Глобальные полифиллы
 */

// Простые полифиллы вместо сложных импортов
if (typeof global.console === 'undefined') {
  global.console = {
    log: (...args) => {},
    warn: (...args) => {},
    error: (...args) => {},
    info: (...args) => {},
    debug: (...args) => {}
  };
}

if (typeof global.Error === 'undefined') {
  global.Error = class Error {
    constructor(message) {
      this.message = message;
      this.name = 'Error';
    }
  };
}

if (typeof global.Blob === 'undefined') {
  global.Blob = class Blob {
    constructor(content, options) {
      this.content = content;
      this.options = options;
    }
  };
}

if (typeof global.URL === 'undefined') {
  global.URL = class URL {
    constructor(url, base) {
      this.href = url;
      this.origin = '';
      this.protocol = '';
      this.host = '';
      this.hostname = '';
      this.port = '';
      this.pathname = '';
      this.search = '';
      this.hash = '';
    }
  };
}

if (typeof global.fetch === 'undefined') {
  global.fetch = async (url, options) => {
    throw new Error('fetch is not available in this environment');
  };
}

console.log('[Global Polyfills] Полифиллы загружены');

export default {}; 