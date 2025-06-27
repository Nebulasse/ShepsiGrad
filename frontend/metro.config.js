// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Добавляем поддержку svg и других файлов
config.resolver.assetExts.push(
  // Изображения
  'bmp',
  'gif',
  'jpg',
  'jpeg',
  'png',
  'psd',
  'webp',
  // Видео
  'mp4',
  'mov',
  // Аудио
  'mp3',
  'wav',
  'ogg'
);

// Добавляем svg в sourceExts для обработки через transformer
config.resolver.sourceExts.push('svg');

// Добавляем поддержку SVGR для React Native
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Добавляем поддержку mjs и cjs
config.resolver.sourceExts = [
  'js',
  'jsx',
  'json',
  'ts',
  'tsx',
  'cjs',
  'mjs',
  'svg'
];

// Исправляем проблему с URI malformed
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Безопасная обработка запроса
      try {
        // Проверяем и очищаем URI перед обработкой
        if (req.url) {
          // Проверяем наличие некорректных символов в URL
          try {
            decodeURI(req.url);
          } catch (e) {
            // Если URL некорректен, заменяем его на безопасный
            console.warn('Обнаружен некорректный URI, исправляем:', req.url);
            req.url = encodeURI(req.url.replace(/[^\x20-\x7E]/g, ''));
          }
        }
        
        return middleware(req, res, next);
      } catch (error) {
        console.error('Ошибка в middleware Metro:', error);
        return next();
      }
    };
  }
};

module.exports = config; 