import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

// Базовая функция для выполнения API запросов
async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const token = await AsyncStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const requestOptions: RequestInit = {
    method: options.method || 'GET',
    headers,
  };
  
  if (options.body) {
    requestOptions.body = JSON.stringify(options.body);
  }
  
  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, requestOptions);
    
    // Если ответ 401 (Unauthorized), пробуем обновить токен
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // Повторяем запрос с новым токеном
        const newToken = await AsyncStorage.getItem('auth_token');
        headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await fetch(`${config.apiUrl}${endpoint}`, {
          ...requestOptions,
          headers,
        });
        return processResponse(retryResponse);
      }
      
      // Если не удалось обновить токен, выбрасываем ошибку
      throw new Error('Authentication failed');
    }
    
    return processResponse(response);
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Обработка ответа от сервера
async function processResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  }
  
  if (!response.ok) {
    throw new Error('API request failed');
  }
  
  return await response.text();
}

// Функция для обновления токена
async function refreshToken() {
  const refreshToken = await AsyncStorage.getItem('refresh_token');
  if (!refreshToken) {
    return false;
  }
  
  try {
    const response = await fetch(`${config.apiUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      await AsyncStorage.setItem('auth_token', data.token);
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
    return false;
  }
}

// API методы
export const api = {
  get: (endpoint: string, params?: Record<string, any>) => {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params as any).toString()}` 
      : endpoint;
    return apiRequest(url);
  },
  
  post: (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: data,
    });
  },
  
  put: (endpoint: string, data?: any) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: data,
    });
  },
  
  delete: (endpoint: string) => {
    return apiRequest(endpoint, {
      method: 'DELETE',
    });
  },
};

// Функция для авторизации
export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  
  if (response.token) {
    await AsyncStorage.setItem('auth_token', response.token);
    if (response.refresh_token) {
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
    }
  }
  
  return response;
};

// Функция для регистрации
export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  
  if (response.token) {
    await AsyncStorage.setItem('auth_token', response.token);
    if (response.refresh_token) {
      await AsyncStorage.setItem('refresh_token', response.refresh_token);
    }
  }
  
  return response;
};

// Функция для выхода
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('refresh_token');
  }
};

// Функция для получения текущего пользователя
export const getCurrentUser = async () => {
  return await api.get('/users/me');
};

// Функция для обновления профиля пользователя
export const updateUserProfile = async (userData: any) => {
  return await api.put('/users/me', userData);
};

// Функция для создания бронирования
export const createBooking = async (bookingData: any) => {
  return await api.post('/bookings', bookingData);
};

// Функция для получения бронирований пользователя
export const getUserBookings = async (params?: any) => {
  return await api.get('/bookings/user/bookings', params);
};

// Функция для отмены бронирования
export const cancelBooking = async (bookingId: string) => {
  return await api.put(`/bookings/${bookingId}/cancel`);
};

// Функция для создания платежа
export const createPayment = async (bookingId: string) => {
  return await api.post('/bookings/payment/create', { booking_id: bookingId });
};

// Функция для проверки статуса платежа
export const checkPaymentStatus = async (bookingId: string) => {
  return await api.get(`/bookings/payment/status/${bookingId}`);
};

// Функция для возврата платежа
export const refundPayment = async (bookingId: string) => {
  return await api.post('/bookings/payment/refund', { booking_id: bookingId });
};

// Экспорт по умолчанию для совместимости с expo-router
export default api; 