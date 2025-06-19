import { API_URL } from '../config';
import * as SecureStore from 'expo-secure-store';

// Типы данных
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'landlord' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  // Инициализация сервиса и проверка сохраненной сессии
  async initialize(): Promise<boolean> {
    try {
      this.authToken = await SecureStore.getItemAsync('auth_token');
      this.refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      if (!this.authToken) {
        return false;
      }

      // Проверка валидности токена
      const user = await this.getCurrentUser();
      this.currentUser = user;
      return true;
    } catch (error) {
      console.error('Ошибка при инициализации AuthService:', error);
      await this.logout();
      return false;
    }
  }

  // Регистрация нового пользователя
  async register(email: string, password: string, name: string, phone?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/register/landlord`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      const authData = await response.json();
      await this.saveAuthData(authData);
      return authData;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  }

  // Вход в систему
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: 'landlord',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      const authData = await response.json();
      await this.saveAuthData(authData);
      return authData;
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  }

  // Выход из системы
  async logout(): Promise<void> {
    try {
      // Отправляем запрос на сервер для инвалидации токена
      if (this.authToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {
          // Игнорируем ошибки при выходе
        });
      }
    } finally {
      // Очищаем локальные данные
      this.authToken = null;
      this.refreshToken = null;
      this.currentUser = null;
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('user_data');
    }
  }

  // Обновление токена
  async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const authData = await response.json();
      await this.saveAuthData(authData);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      await this.logout();
      return false;
    }
  }

  // Получение текущего пользователя
  async getCurrentUser(): Promise<User> {
    if (this.currentUser) {
      return this.currentUser;
    }

    if (!this.authToken) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Токен истек, пробуем обновить
          const refreshed = await this.refreshAuthToken();
          if (refreshed) {
            return this.getCurrentUser();
          }
          throw new Error('Сессия истекла');
        }
        throw new Error(`Ошибка: ${response.status}`);
      }

      const userData = await response.json();
      this.currentUser = userData;
      return userData;
    } catch (error) {
      console.error('Ошибка при получении данных пользователя:', error);
      throw error;
    }
  }

  // Обновление данных пользователя
  async updateUserProfile(data: Partial<User>): Promise<User> {
    if (!this.authToken) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const updatedUser = await response.json();
      this.currentUser = updatedUser;
      await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  }

  // Смена пароля
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    if (!this.authToken) {
      throw new Error('Пользователь не авторизован');
    }

    try {
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при смене пароля:', error);
      throw error;
    }
  }

  // Запрос на сброс пароля
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Ошибка при запросе сброса пароля:', error);
      throw error;
    }
  }

  // Получение токена для API запросов
  getToken(): string | null {
    return this.authToken;
  }

  // Проверка авторизации пользователя
  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Сохранение данных авторизации
  private async saveAuthData(authData: AuthResponse): Promise<void> {
    this.authToken = authData.token;
    this.refreshToken = authData.refreshToken;
    this.currentUser = authData.user;

    await SecureStore.setItemAsync('auth_token', authData.token);
    await SecureStore.setItemAsync('refresh_token', authData.refreshToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(authData.user));
  }
}

export const authService = new AuthService(); 