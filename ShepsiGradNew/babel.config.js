module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-flow-strip-types',
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      ['module-resolver', {
        alias: {
          // Определяем алиасы для модулей, чтобы избежать проблем с импортами
          'react-native': './node_modules/react-native',
          'expo': './node_modules/expo',
          '@': './',
        },
      }],
      // Добавляем плагин для отключения новой архитектуры
      [
        'transform-define',
        {
          'global.__REACT_NATIVE_NEW_ARCHITECTURE_ENABLED': false,
        },
      ]
    ]
  };
}; 