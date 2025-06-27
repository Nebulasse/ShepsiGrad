import { ExpoConfig, ConfigContext } from 'expo/config';

// Принудительно отключаем Hermes
process.env.EXPO_USE_HERMES = "0";
process.env.EXPO_JS_ENGINE = "jsc";
process.env.EXPO_NO_HERMES = "1";
process.env.JS_ENGINE = "jsc";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: 'ShepsiGrad Landlord',
    slug: 'shepsigrad-landlord',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.shepsigrad.landlord',
      jsEngine: 'jsc',
      hermes: false
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: 'com.shepsigrad.landlord',
      jsEngine: 'jsc',
      hermes: false
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      output: 'static',
      jsEngine: 'jsc',
      hermes: false,
      build: {
        babel: {
          include: [
            'expo-router',
            '@expo/vector-icons'
          ]
        }
      }
    },
    plugins: [
      'expo-router',
      [
        'expo-secure-store',
        {
          faceIDPermission: 'Разрешите использование Face ID для входа в аккаунт'
        }
      ]
    ],
    scheme: 'shepsigrad-landlord',
    extra: {
      router: {
        origin: false
      },
      eas: {
        rustore: {
          enabled: true
        },
        projectId: 'e5388555-1665-4af3-b6ca-56e025ca4156'
      },
      rustore: {
        enabled: true
      },
      apiUrl: process.env.API_URL || 'https://shepsigrad-api.example.com',
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    },
    jsEngine: 'jsc',
    hermes: false,
    experiments: {
      tsconfigPaths: true
    },
    // Дополнительные настройки для отключения Hermes
    _internal: {
      isDebug: false,
      projectRoot: __dirname,
      dynamicConfigPath: null,
      staticConfigPath: null,
      packageJsonPath: null,
    }
  };
};
