// @ts-nocheck
// Расширяем глобальный объект для TypeScript
declare global {
  namespace NodeJS {
    interface Global {
      PlatformConstants: any;
      TurboModuleRegistry: any;
    }
  }
}

// Полифил для PlatformConstants и TurboModuleRegistry
import { Platform, Dimensions } from 'react-native';

// Создаем необходимые полифилы перед импортом других модулей
(function setupPolyfills() {
  // Создаем TurboModuleRegistry если его нет
  if (typeof global !== 'undefined' && !global.TurboModuleRegistry) {
    global.TurboModuleRegistry = {
      get: function(name) {
        console.log(`TurboModuleRegistry.get вызван для ${name}`);
        if (name === 'PlatformConstants' && global.PlatformConstants) {
          return global.PlatformConstants;
        }
        return null;
      },
      getEnforcing: function(name) {
        console.log(`TurboModuleRegistry.getEnforcing вызван для ${name}`);
        if (name === 'PlatformConstants' && global.PlatformConstants) {
          return global.PlatformConstants;
        }
        throw new Error(`Модуль ${name} не найден в TurboModuleRegistry`);
      },
      registerModule: function(name, factory) {
        console.log(`Регистрация модуля ${name} в TurboModuleRegistry`);
        // @ts-ignore - Игнорируем ошибку индексации для глобального объекта
        global[name] = factory();
        return factory();
      }
    };
  }

  // Создаем PlatformConstants если его нет
  if (typeof global !== 'undefined' && !global.PlatformConstants) {
    // Получаем текущие размеры экрана
    const windowDimensions = Dimensions.get('window');
    const screenDimensions = Dimensions.get('screen');
    
    // Создаем полифил для PlatformConstants
    const constants = {
      reactNativeVersion: {
        major: 0,
        minor: 73,
        patch: 4,
      },
      Version: 1,
      isTesting: false,
      isDisabled: false,
      OS: Platform.OS,
      // Добавляем другие необходимые свойства
      UIImplementation: 'ReactNativeRenderer',
      // Для Android
      ...(Platform.OS === 'android' && {
        Dimensions: {
          windowPhysicalPixels: {
            width: windowDimensions.width * (windowDimensions.scale || 1),
            height: windowDimensions.height * (windowDimensions.scale || 1),
            scale: windowDimensions.scale || 2.75,
            fontScale: windowDimensions.fontScale || 1,
            densityDpi: windowDimensions.scale ? windowDimensions.scale * 160 : 440,
          },
          screenPhysicalPixels: {
            width: screenDimensions.width * (screenDimensions.scale || 1),
            height: screenDimensions.height * (screenDimensions.scale || 1),
            scale: screenDimensions.scale || 2.75,
            fontScale: screenDimensions.fontScale || 1,
            densityDpi: screenDimensions.scale ? screenDimensions.scale * 160 : 440,
          }
        },
        uiMode: 'normal',
        Brand: 'Android',
        Model: 'Generic',
        Release: '13',
      }),
      // Для iOS
      ...(Platform.OS === 'ios' && {
        forceTouchAvailable: false,
        interfaceIdiom: 'handset',
        osVersion: '16.0',
        systemName: 'iOS',
        isTVOS: false,
      }),
    };

    // @ts-ignore - Игнорируем ошибку типизации для метода getConstants
    constants.getConstants = function() { return constants; };

    // Устанавливаем глобальный PlatformConstants
    global.PlatformConstants = constants;
    
    // Регистрируем модуль в TurboModuleRegistry
    if (global.TurboModuleRegistry) {
      try {
        global.TurboModuleRegistry.registerModule('PlatformConstants', () => constants);
        console.log('PlatformConstants успешно зарегистрирован в TurboModuleRegistry');
      } catch (e) {
        console.error('Ошибка при регистрации PlatformConstants в TurboModuleRegistry:', e);
      }
    }
    
    console.log('PlatformConstants полифил создан');
  }

  // Переопределяем методы TurboModuleRegistry для обработки запросов PlatformConstants
  if (global.TurboModuleRegistry) {
    const originalGet = global.TurboModuleRegistry.get;
    global.TurboModuleRegistry.get = function(name) {
      if (name === 'PlatformConstants') {
        return global.PlatformConstants;
      }
      return originalGet.call(global.TurboModuleRegistry, name);
    };
    
    const originalGetEnforcing = global.TurboModuleRegistry.getEnforcing;
    global.TurboModuleRegistry.getEnforcing = function(name) {
      if (name === 'PlatformConstants') {
        return global.PlatformConstants;
      }
      return originalGetEnforcing.call(global.TurboModuleRegistry, name);
    };
  }
})();

// Проверяем, что полифил загружен
if (!global.PlatformConstants) {
  console.error('PlatformConstants полифил не был загружен корректно');
}

// Удаляем импорты пакетов, которые не могут быть найдены
// import '@react-native/polyfills';
// import '@react-native/assets-registry';
// import '@react-native/normalize-colors';

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
