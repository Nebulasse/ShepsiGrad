import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Функция для сохранения токена в зависимости от платформы
const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('token', token);
  } else {
    try {
      // Пробуем использовать SecureStore для iOS/Android
      await SecureStore.setItemAsync('token', token);
    } catch (error) {
      // Если не получилось, используем AsyncStorage
      await AsyncStorage.setItem('token', token);
    }
  }
};

// Функция для получения токена в зависимости от платформы
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  } else {
    try {
      // Пробуем использовать SecureStore для iOS/Android
      const token = await SecureStore.getItemAsync('token');
      return token;
    } catch (error) {
      // Если не получилось, используем AsyncStorage
      const token = await AsyncStorage.getItem('token');
      return token;
    }
  }
};

// Функция для удаления токена в зависимости от платформы
const removeToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('token');
  } else {
    try {
      // Пробуем использовать SecureStore для iOS/Android
      await SecureStore.deleteItemAsync('token');
    } catch (error) {
      // Если не получилось, используем AsyncStorage
      await AsyncStorage.removeItem('token');
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const segments = useSegments();

  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.user && response.data.user.role === 'admin') {
        setUser(response.data.user);
      } else {
        // Если пользователь не админ, выходим из системы
        logout();
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.user && response.data.user.role === 'admin') {
        await saveToken(response.data.token);
        setUser(response.data.user);
        
        // Перенаправляем на главную страницу
        if (Platform.OS === 'web') {
          router.replace('/');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        throw new Error('Только администраторы могут войти в панель управления');
      }
    } catch (error: any) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const logout = async () => {
    await removeToken();
    setUser(null);
    router.replace('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 