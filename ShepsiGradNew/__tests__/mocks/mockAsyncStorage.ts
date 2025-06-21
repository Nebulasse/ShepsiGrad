/**
 * Мок для AsyncStorage
 * Используется для тестирования компонентов, которые используют AsyncStorage
 */

const mockStorage: Record<string, string> = {};

const AsyncStorage = {
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockStorage[key] || null);
  }),
  
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
  
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => {
      delete mockStorage[key];
    });
    return Promise.resolve();
  }),
  
  getAllKeys: jest.fn(() => {
    return Promise.resolve(Object.keys(mockStorage));
  }),
  
  multiGet: jest.fn((keys: string[]) => {
    const values = keys.map(key => [key, mockStorage[key] || null]);
    return Promise.resolve(values);
  }),
  
  multiSet: jest.fn((keyValuePairs: [string, string][]) => {
    keyValuePairs.forEach(([key, value]) => {
      mockStorage[key] = value;
    });
    return Promise.resolve();
  }),
  
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach(key => {
      delete mockStorage[key];
    });
    return Promise.resolve();
  }),
  
  // Добавляем токен авторизации для тестов
  setup: () => {
    mockStorage['userToken'] = 'test-token';
    mockStorage['user'] = JSON.stringify({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    });
  },
  
  // Очистка хранилища
  reset: () => {
    Object.keys(mockStorage).forEach(key => {
      delete mockStorage[key];
    });
  }
};

export default AsyncStorage; 