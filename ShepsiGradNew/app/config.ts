// Конфигурация приложения
interface Config {
  // URL API бэкенда
  apiUrl: string;
  
  // Настройки для платежей
  payments: {
    // URL для возврата после оплаты
    returnUrl: string;
  };
  
  // Настройки для карт
  maps: {
    apiKey: string;
  };
}

// Определение конфигурации в зависимости от окружения
const devConfig: Config = {
  apiUrl: 'http://192.168.1.100:3000/api', // Замените на IP вашего компьютера в локальной сети
  payments: {
    returnUrl: 'shepsigrad://payment/callback',
  },
  maps: {
    apiKey: 'YOUR_MAPS_API_KEY', // Замените на ваш API ключ для карт
  },
};

const prodConfig: Config = {
  apiUrl: 'https://api.shepsigrad.com/api',
  payments: {
    returnUrl: 'shepsigrad://payment/callback',
  },
  maps: {
    apiKey: 'YOUR_MAPS_API_KEY', // Замените на ваш API ключ для карт
  },
};

// Выбор конфигурации в зависимости от окружения
export const config: Config = __DEV__ ? devConfig : prodConfig;

export default config; 