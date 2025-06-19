// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Отключаем новую архитектуру в Metro
config.resolver.unstable_enablePackageExports = false;
config.resolver.unstable_conditionNames = [];

// Включаем использование require.context для поддержки expo-router
config.transformer.unstable_allowRequireContext = true;

// Добавляем дополнительные настройки для совместимости
config.resolver.sourceExts = ['js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'];
config.resolver.assetExts = ['bmp', 'gif', 'jpg', 'jpeg', 'png', 'webp', 'svg', 'ttf', 'otf'];

module.exports = config; 