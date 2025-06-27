import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Определяем базовый URL для API в зависимости от окружения
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // Для веб-версии используем относительный путь
    return '/api';
  } else {
    // Для мобильной версии используем полный URL
    // В реальном приложении здесь должен быть URL вашего API
    return 'https://api.shepsigrad.com/api';
  }
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Ошибка при получении токена:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 (Unauthorized) и запрос не повторялся
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Попытка обновить токен
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${getBaseUrl()}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Сохраняем новые токены
          await AsyncStorage.setItem('authToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          // Обновляем заголовок и повторяем запрос
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Если не удалось обновить токен, выходим из системы
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('user');
        
        // Для веб-версии перенаправляем на страницу входа
        if (Platform.OS === 'web') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api; 