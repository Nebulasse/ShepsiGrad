import axios from 'axios';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Константы и типы
const API_URL = 'http://localhost:5000/api';
const STORAGE_KEY = 'auth_token';

// Настройки Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Типы данных
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  role: 'user' | 'admin' | 'landlord';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PhoneVerifyParams {
  phone: string;
  otp: string;
}

export interface AuthError extends Error {
  code?: string;
  status?: number;
}

export interface SocialAuthProvider {
  provider: 'google' | 'facebook' | 'vk';
  scopes?: string[];
}

class AuthService {
  private supabase: SupabaseClient;
  private currentUser: User | null = null;
  
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    this.loadUserFromStorage();
  }

  // Загрузка пользователя из локального хранилища
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentUser = {
          id: payload.id,
          email: payload.email,
          full_name: payload.full_name || '',
          phone_number: payload.phone_number || '',
          role: payload.role
        };
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  // Получение токена доступа
  async getAccessToken(): Promise<string | null> {
    return localStorage.getItem(STORAGE_KEY);
  }

  // Получение текущего пользователя
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Регистрация пользователя
  async register(email: string, password: string, userData: Partial<User>): Promise<AuthResponse> {
    try {
      // Регистрация через Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Ошибка при создании пользователя');

      // Создание профиля пользователя в нашем API
      const response = await axios.post(`${API_URL}/auth/register`, {
        id: authData.user.id,
        email: authData.user.email,
        ...userData
      });

      const { user, token } = response.data;
      this.saveAuthData(token, user);
      return { user, token };
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  }

  // Вход пользователя по email и паролю
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Аутентификация через Supabase
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Ошибка аутентификации');

      // Получение JWT-токена для нашей системы
      const response = await axios.post(`${API_URL}/auth/login`, {
        id: authData.user.id,
        email: authData.user.email
      });

      const { user, token } = response.data;
      this.saveAuthData(token, user);
      return { user, token };
    } catch (error) {
      console.error('Ошибка при входе:', error);
      throw error;
    }
  }

  // Отправка OTP на телефон
  async sendPhoneOtp(phone: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/send-otp`, { phone });
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке кода:', error);
      throw error;
    }
  }

  // Вход по номеру телефона и OTP
  async loginWithPhone(params: PhoneVerifyParams): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, params);
      const { user, token } = response.data;
      this.saveAuthData(token, user);
      return { user, token };
    } catch (error) {
      console.error('Ошибка при входе по телефону:', error);
      throw error;
    }
  }

  // Аутентификация через социальную сеть
  async loginWithSocialProvider({ provider, scopes = [] }: SocialAuthProvider): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: scopes.join(' ')
        }
      });

      if (error) throw error;
      if (!data.url) throw new Error('Ошибка при получении URL для авторизации');

      // Перенаправление на страницу авторизации провайдера
      window.location.href = data.url;
    } catch (error) {
      console.error(`Ошибка при входе через ${provider}:`, error);
      throw error;
    }
  }

  // Обработка callback от OAuth провайдера
  async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      // Получаем данные аутентификации из Supabase
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      if (!data.session?.user) throw new Error('Сессия не найдена');

      // Регистрируем или обновляем пользователя в нашем API
      const response = await axios.post(`${API_URL}/auth/social-login`, {
        id: data.session.user.id,
        email: data.session.user.email,
        provider: data.session.user.app_metadata.provider
      });

      const { user, token } = response.data;
      this.saveAuthData(token, user);
      return { user, token };
    } catch (error) {
      console.error('Ошибка при обработке OAuth callback:', error);
      throw error;
    }
  }

  // Отправка запроса на сброс пароля
  async resetPassword(email: string): Promise<{ message: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      return { message: 'Инструкции по сбросу пароля отправлены на ваш email' };
    } catch (error) {
      console.error('Ошибка при сбросе пароля:', error);
      throw error;
    }
  }

  // Подтверждение сброса пароля
  async confirmPasswordReset(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Используем токен для установки нового пароля
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return { message: 'Пароль успешно изменен' };
    } catch (error) {
      console.error('Ошибка при подтверждении сброса пароля:', error);
      throw error;
    }
  }

  // Обновление данных пользователя
  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${await this.getAccessToken()}`
          }
        }
      );
      
      // Обновляем данные в локальном хранилище
      if (this.currentUser) {
        this.currentUser = { ...this.currentUser, ...userData };
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
      throw error;
    }
  }

  // Выход пользователя
  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      localStorage.removeItem(STORAGE_KEY);
      this.currentUser = null;
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  }

  // Сохранение данных аутентификации
  private saveAuthData(token: string, user: User): void {
    localStorage.setItem(STORAGE_KEY, token);
    this.currentUser = user;
  }
}

export const authService = new AuthService(); 