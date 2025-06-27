// Простая конфигурация Metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Отключаем функцию package exports
config.resolver.unstable_enablePackageExports = false;

module.exports = config; 