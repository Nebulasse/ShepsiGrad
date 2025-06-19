const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Добавляем алиасы для решения проблем с зависимостями
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'react-native/Libraries/Image/Image': 'react-native-web/dist/exports/Image',
    '@react-native': 'react-native-web/dist/exports',
  };

  // Добавляем fallback для node модулей
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'crypto': require.resolve('crypto-browserify'),
    'stream': require.resolve('stream-browserify'),
    'buffer': require.resolve('buffer/'),
    'http': require.resolve('stream-http'),
    'https': require.resolve('https-browserify'),
    'zlib': require.resolve('browserify-zlib'),
    'path': require.resolve('path-browserify'),
    'fs': false,
    'net': false,
    'tls': false,
  };

  return config;
}; 