import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Определение типов
interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'host' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Создание контекста
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Временные данные для демонстрации
const DEMO_USER: User = {
  id: 'user-123',
  name: 'Демо Пользователь',
  email: 'demo@example.com',
  role: 'guest',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
};

// Провайдер контекста
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка данных пользователя при инициализации
  useEffect(() => {
    const loadUser = async () => {
      try {
        // В реальном приложении здесь будет проверка токена и загрузка данных пользователя
        const userJson = await SecureStore.getItemAsync('user');
        
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Для демонстрации используем задержку и демо-пользователя
    setTimeout(() => {
      setUser(DEMO_USER);
      setIsLoading(false);
    }, 1000);

    // loadUser();
  }, []);

  // Функция входа
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post('/auth/login', { email, password });
      // const { user, token } = response.data;
      
      // Имитация успешного входа
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Сохраняем пользователя
      setUser(DEMO_USER);
      await SecureStore.setItemAsync('user', JSON.stringify(DEMO_USER));
      
    } catch (error) {
      console.error('Ошибка при входе:', error);
      Alert.alert('Ошибка', 'Неверный email или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция регистрации
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.post('/auth/register', { email, password, name });
      // const { user, token } = response.data;
      
      // Имитация успешной регистрации
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = { ...DEMO_USER, email, name };
      
      // Сохраняем пользователя
      setUser(newUser);
      await SecureStore.setItemAsync('user', JSON.stringify(newUser));
      
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      Alert.alert('Ошибка', 'Не удалось зарегистрироваться');
    } finally {
      setIsLoading(false);
    }
  };

  // Функция выхода
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // В реальном приложении здесь может быть API запрос для инвалидации токена
      
      // Удаляем данные пользователя
      setUser(null);
      await SecureStore.deleteItemAsync('user');
      
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
      
      // В реальном приложении здесь будет API запрос
      // const response = await apiClient.put('/users/profile', userData);
      // const updatedUser = response.data;
      
      // Имитация успешного обновления
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...userData } as User;
      
      // Сохраняем обновленного пользователя
      setUser(updatedUser);
      await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      Alert.alert('Ошибка', 'Не удалось обновить профиль');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
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