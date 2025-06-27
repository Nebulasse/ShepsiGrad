import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, phone?: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: async () => { throw new Error('Not implemented'); },
  updateUser: async () => { throw new Error('Not implemented'); },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем наличие сохраненных данных пользователя при загрузке
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('shepsigrad_landlord_user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          setUser(userData);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // Имитация запроса к API
    try {
      // В реальном приложении здесь будет запрос к API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Тестовый пользователь
      const mockUser: User = {
        id: '123456',
        email,
        name: 'Тестовый Арендодатель',
        role: 'landlord',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Сохраняем данные пользователя и токен
      await AsyncStorage.setItem('shepsigrad_landlord_user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('shepsigrad_landlord_token', 'mock-token-for-testing');
      
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, phone?: string): Promise<User> => {
    // Имитация запроса к API
    try {
      // В реальном приложении здесь будет запрос к API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Тестовый пользователь
      const mockUser: User = {
        id: '123456',
        email,
        name,
        phone,
        role: 'landlord',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Сохраняем данные пользователя и токен
      await AsyncStorage.setItem('shepsigrad_landlord_user', JSON.stringify(mockUser));
      await AsyncStorage.setItem('shepsigrad_landlord_token', 'mock-token-for-testing');
      
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Очищаем данные пользователя и токен
      await AsyncStorage.removeItem('shepsigrad_landlord_user');
      await AsyncStorage.removeItem('shepsigrad_landlord_token');
      
      setUser(null);
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<User> => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }
      
      // Обновляем данные пользователя
      const updatedUser = {
        ...user,
        ...userData,
        updatedAt: new Date().toISOString(),
      };
      
      // Сохраняем обновленные данные
      await AsyncStorage.setItem('shepsigrad_landlord_user', JSON.stringify(updatedUser));
      
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 