/**
 * Мок для expo-router
 * Используется для тестирования компонентов, которые используют функции из expo-router
 */

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  setParams: jest.fn(),
  canGoBack: jest.fn().mockReturnValue(true),
  navigate: jest.fn(),
};

const useRouter = jest.fn(() => mockRouter);

const useLocalSearchParams = jest.fn().mockImplementation(() => {
  return {
    id: 'test-id',
    propertyId: 'property-test-id',
  };
});

const useSegments = jest.fn().mockReturnValue(['']);

const Link = ({ href, onPress, children, ...props }: any) => {
  return children;
};

const Stack = {
  Screen: ({ children, ...props }: any) => children,
};

const Tabs = {
  Screen: ({ children, ...props }: any) => children,
};

export {
  useRouter,
  useLocalSearchParams,
  useSegments,
  Link,
  Stack,
  Tabs,
  mockRouter,
};

// Экспортируем по умолчанию для использования в jest.mock
export default {
  useRouter,
  useLocalSearchParams,
  useSegments,
  Link,
  Stack,
  Tabs,
}; 