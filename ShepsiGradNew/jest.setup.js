// Мок для AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage = {};
  
  return {
    getItem: jest.fn((key) => Promise.resolve(mockStorage[key] || null)),
    setItem: jest.fn((key, value) => {
      mockStorage[key] = value;
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      delete mockStorage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStorage))),
    multiGet: jest.fn((keys) => {
      return Promise.resolve(keys.map(key => [key, mockStorage[key] || null]));
    }),
    multiSet: jest.fn((keyValuePairs) => {
      keyValuePairs.forEach(([key, value]) => {
        mockStorage[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach(key => delete mockStorage[key]);
      return Promise.resolve();
    })
  };
});

// Мок для expo-router
jest.mock('expo-router', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
    canGoBack: jest.fn().mockReturnValue(true),
    navigate: jest.fn(),
  };

  return {
    useRouter: jest.fn(() => mockRouter),
    useLocalSearchParams: jest.fn(() => ({
      id: 'test-id',
      propertyId: 'property-test-id',
    })),
    useSegments: jest.fn(() => ['']),
    Link: ({ children }) => children,
    Stack: { Screen: ({ children }) => children },
    Tabs: { Screen: ({ children }) => children },
  };
});

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

// Инициализация данных для тестов
const mockStorage = require('@react-native-async-storage/async-storage');
if (mockStorage.setItem) {
  mockStorage.setItem('userToken', 'test-token');
  mockStorage.setItem('user', JSON.stringify({
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user'
  }));
} 