// Импортируем полифил для PlatformConstants в первую очередь
import './platformConstants';

// Импортируем полифил для WebSocket
import './websocketPolyfill';

// Базовые полифилы React Native - закомментируем, так как они не могут быть найдены
// import '@react-native/polyfills';
// import '@react-native/assets-registry';
// import '@react-native/normalize-colors';

// Импорты необходимых модулей
import 'react-native-gesture-handler';
import '@react-native-community/netinfo';

// Инициализация других модулей по необходимости
console.log('Модули инициализированы');

// Экспортируем объект с информацией о модулях
const modules = {
  initialized: true,
  timestamp: new Date().toISOString()
};

export default modules; 