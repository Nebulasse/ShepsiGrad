// Полифил для PlatformConstants
import { Platform, Dimensions } from 'react-native';

// Интерфейс для PlatformConstants
interface PlatformConstantsType {
  reactNativeVersion: {
    major: number;
    minor: number;
    patch: number;
  };
  Version: number;
  isTesting: boolean;
  isDisabled: boolean;
  OS: string;
  UIImplementation: string;
  Dimensions?: {
    windowPhysicalPixels: {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
      densityDpi: number;
    };
    screenPhysicalPixels: {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
      densityDpi: number;
    };
  };
  forceTouchAvailable?: boolean;
  interfaceIdiom?: string;
  osVersion?: string;
  systemName?: string;
  isTVOS?: boolean;
  uiMode?: string;
  Brand?: string;
  Model?: string;
  Release?: string;
  getConstants: () => PlatformConstantsType;
}

// Интерфейс для TurboModuleRegistry
interface TurboModuleRegistryType {
  get: (name: string) => any;
  getEnforcing: (name: string) => any;
  registerModule: (name: string, factory: () => any) => any;
}

// Расширяем глобальный объект
declare global {
  interface Window {
    PlatformConstants?: PlatformConstantsType;
    TurboModuleRegistry?: TurboModuleRegistryType;
    [key: string]: any;
  }
  var PlatformConstants: PlatformConstantsType | undefined;
  var TurboModuleRegistry: TurboModuleRegistryType | undefined;
}

// Создаем TurboModuleRegistry если его нет
if (typeof global !== 'undefined' && !global.TurboModuleRegistry) {
  global.TurboModuleRegistry = {
    get: (name: string) => {
      console.log(`TurboModuleRegistry.get вызван для ${name}`);
      if (name === 'PlatformConstants' && global.PlatformConstants) {
        return global.PlatformConstants;
      }
      return null;
    },
    getEnforcing: (name: string) => {
      console.log(`TurboModuleRegistry.getEnforcing вызван для ${name}`);
      if (name === 'PlatformConstants' && global.PlatformConstants) {
        return global.PlatformConstants;
      }
      throw new Error(`Модуль ${name} не найден в TurboModuleRegistry`);
    },
    registerModule: (name: string, factory: () => any) => {
      console.log(`Регистрация модуля ${name} в TurboModuleRegistry`);
      (global as any)[name] = factory();
      return factory();
    }
  };
}

// Функция для создания полифила
function createPlatformConstantsPolyfill(): PlatformConstantsType {
  // Получаем текущие размеры экрана
  const windowDimensions = Dimensions.get('window');
  const screenDimensions = Dimensions.get('screen');
  
  // Создаем полифил для PlatformConstants
  const constants: PlatformConstantsType = {
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
    ...(Platform.OS === 'android' ? {
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
    } : {}),
    // Для iOS
    ...(Platform.OS === 'ios' ? {
      forceTouchAvailable: false,
      interfaceIdiom: 'handset',
      osVersion: '16.0',
      systemName: 'iOS',
      isTVOS: false,
    } : {}),
    // Добавляем метод getConstants
    getConstants: function() { return this; }
  };
  
  return constants;
}

// Создаем полифил для PlatformConstants если его нет
if (!global.PlatformConstants) {
  const constants = createPlatformConstantsPolyfill();
  
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
  
  // Для отладки
  console.log('PlatformConstants полифил создан');
}

// Переопределяем методы TurboModuleRegistry для обработки запросов PlatformConstants
if (global.TurboModuleRegistry) {
  const originalGet = global.TurboModuleRegistry.get;
  global.TurboModuleRegistry.get = (name: string) => {
    if (name === 'PlatformConstants') {
      return global.PlatformConstants;
    }
    return originalGet(name);
  };
  
  const originalGetEnforcing = global.TurboModuleRegistry.getEnforcing;
  global.TurboModuleRegistry.getEnforcing = (name: string) => {
    if (name === 'PlatformConstants') {
      return global.PlatformConstants;
    }
    return originalGetEnforcing(name);
  };
}

// Экспортируем PlatformConstants для использования в других модулях
export default global.PlatformConstants as PlatformConstantsType; 