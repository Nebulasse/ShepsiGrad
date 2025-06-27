import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, AUTH_CONFIG } from '../config';

// Интерфейсы для типизации
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserData;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
    'X-App-ID': API_CONFIG.appId,
    'X-App-Type': API_CONFIG.appType,
  },
});

// Добавляем перехватчик для автоматического добавления токена к запросам
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_CONFIG.tokenStorageKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Сервис аутентификации
const authService = {
  // Вход пользователя
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log(`Отправка запроса на ${API_CONFIG.baseUrl}${AUTH_CONFIG.endpoints.login}`);
      const response = await api.post(AUTH_CONFIG.endpoints.login, credentials);
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  },

  // Регистрация пользователя
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      console.log(`Отправка запроса на ${API_CONFIG.baseUrl}${AUTH_CONFIG.endpoints.register}`);
      const response = await api.post(AUTH_CONFIG.endpoints.register, userData);
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  },

  // Выход пользователя
  async logout(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(AUTH_CONFIG.tokenStorageKey);
      if (token) {
        // Отправляем запрос на сервер для инвалидации токена
        await api.post(AUTH_CONFIG.endpoints.logout);
      }
    } catch (error) {
      console.error('Ошибка при выходе на сервере:', error);
    } finally {
      // В любом случае очищаем локальное хранилище
      await AsyncStorage.removeItem(AUTH_CONFIG.tokenStorageKey);
      await AsyncStorage.removeItem(AUTH_CONFIG.refreshTokenStorageKey);
      await AsyncStorage.removeItem(AUTH_CONFIG.userStorageKey);
    }
  },

  // Обновление токена
  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(AUTH_CONFIG.refreshTokenStorageKey);
      if (!refreshToken) {
        return null;
      }

      const response = await axios.post(
        `${API_CONFIG.baseUrl}${AUTH_CONFIG.endpoints.refreshToken}`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-App-ID': API_CONFIG.appId,
            'X-App-Type': API_CONFIG.appType,
          },
        }
      );

      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        return response.data.token;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      // Если не удалось обновить токен, выходим из системы
      await this.logout();
      return null;
    }
  },

  // Проверка авторизации пользователя
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_CONFIG.tokenStorageKey);
      return !!token;
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      return false;
    }
  },

  // Получение данных текущего пользователя
  async getCurrentUser(): Promise<UserData | null> {
    try {
      const userDataString = await AsyncStorage.getItem(AUTH_CONFIG.userStorageKey);
      if (!userDataString) {
        return null;
      }
      return JSON.parse(userDataString);
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      return null;
    }
  },

  // Сброс пароля
  async resetPassword(email: string): Promise<boolean> {
    try {
      await api.post(AUTH_CONFIG.endpoints.resetPassword, { email });
      return true;
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      throw error;
    }
  },

  // Обновление данных пользователя
  async updateUserProfile(userData: Partial<UserData>): Promise<UserData> {
    try {
      const response = await api.put('/users/profile', userData);
      
      if (response.data && response.data.user) {
        const currentUser = await this.getCurrentUser();
        const updatedUser = { ...currentUser, ...response.data.user };
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(updatedUser));
        return updatedUser;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  },

  // Вход через Google
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/landlord/google', { idToken });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при входе через Google:', error);
      throw error;
    }
  },

  // Вход через Apple
  async loginWithApple(identityToken: string, nonce: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/landlord/apple', { identityToken, nonce });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при входе через Apple:', error);
      throw error;
    }
  },

  // Вход через VK
  async loginWithVK(code: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/landlord/vk', { code });
      
      if (response.data && response.data.token) {
        await AsyncStorage.setItem(AUTH_CONFIG.tokenStorageKey, response.data.token);
        await AsyncStorage.setItem(AUTH_CONFIG.refreshTokenStorageKey, response.data.refreshToken);
        await AsyncStorage.setItem(AUTH_CONFIG.userStorageKey, JSON.stringify(response.data.user));
        return response.data;
      } else {
        throw new Error('Неверный формат ответа от сервера');
      }
    } catch (error) {
      console.error('Ошибка при входе через VK:', error);
      throw error;
    }
  },
};

export default authService; 