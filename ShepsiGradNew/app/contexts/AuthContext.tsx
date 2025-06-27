import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import config from '../config';

// Определение типов
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  full_name?: string;
  role: 'user' | 'landlord' | 'admin';
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных пользователя при инициализации
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Получаем токен из хранилища
        const savedToken = await SecureStore.getItemAsync('auth_token');
        
        if (savedToken) {
          // Устанавливаем токен для API запросов
          api.setAuthToken(savedToken);
          setToken(savedToken);
          
          // Получаем данные пользователя
          const response = await api.get('/auth/profile');
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        // Если токен невалидный, удаляем его
        await SecureStore.deleteItemAsync('auth_token');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Отправляем запрос на вход
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: authToken } = response.data;
      
      // Сохраняем токен и пользователя
      await SecureStore.setItemAsync('auth_token', authToken);
      api.setAuthToken(authToken);
      setToken(authToken);
      setUser(userData);
      
    } catch (error) {
      console.error('Ошибка при входе:', error);
      Alert.alert('Ошибка', 'Неверный email или пароль');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция регистрации
  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      setIsLoading(true);
      
      // Отправляем запрос на регистрацию
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        firstName, 
        lastName 
      });
      
      const { user: userData, token: authToken } = response.data;
      
      // Сохраняем токен и пользователя
      await SecureStore.setItemAsync('auth_token', authToken);
      api.setAuthToken(authToken);
      setToken(authToken);
      setUser(userData);
      
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Отправляем запрос на выход (если требуется)
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // Игнорируем ошибки при выходе
      }
      
      // Удаляем токен и данные пользователя
      await SecureStore.deleteItemAsync('auth_token');
      api.setAuthToken(null);
      setToken(null);
      setUser(null);
      
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Функция обновления профиля
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Отправляем запрос на обновление профиля
      const response = await api.put('/users/profile', userData);
      const updatedUser = response.data.user;
      
      // Обновляем данные пользователя
      setUser(updatedUser);
      
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export default AuthContext; 