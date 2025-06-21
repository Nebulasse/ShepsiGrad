// Мок для AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => require('./__tests__/mocks/mockAsyncStorage').default);

// Мок для expo-router
jest.mock('expo-router', () => require('./__tests__/mocks/mockExpoRouter').default);

// Мок для Expo Font
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
  loadAsync: jest.fn(() => Promise.resolve()),
}));

// Мок для Expo SplashScreen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Мок для Expo Constants
jest.mock('expo-constants', () => ({
  Constants: {
    expoConfig: {
      extra: {
        apiUrl: 'https://test-api.example.com',
      },
    },
  },
}));

// Мок для Expo WebBrowser
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(() => Promise.resolve({ type: 'success', url: 'https://example.com/auth/callback' })),
}));

// Мок для React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    ScrollView: View,
    FlatList: require('react-native/Libraries/Lists/FlatList'),
    State: {},
  };
});

// Мок для React Native Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Мок для React Native Maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockMapView = (props) => {
    return <View {...props} />;
  };
  
  const MockMarker = (props) => {
    return <View {...props} />;
  };
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    PROVIDER_GOOGLE: 'google',
  };
});

// Отключаем предупреждения в тестах
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

// Настройка для React Native
global.__reanimatedWorkletInit = jest.fn();

// Инициализация AsyncStorage для тестов
require('./__tests__/mocks/mockAsyncStorage').default.setup(); 