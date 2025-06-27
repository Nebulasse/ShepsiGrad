import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';
import { User } from '../models/User';

const logger = getModuleLogger('AuthService');

// Интерфейс для токена
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Интерфейс для результата аутентификации
export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

/**
 * Сервис для работы с аутентификацией и авторизацией
 */
export class AuthService {
  /**
   * Регистрация нового пользователя
   * @param userData Данные пользователя
   * @returns Результат регистрации
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
  }): Promise<User> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Создаем нового пользователя
      const user = await User.create({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'user',
        emailVerified: false,
        status: 'pending',
        emailVerificationToken: uuidv4(),
      });

      return user;
    } catch (error) {
      logger.error(`Ошибка при регистрации пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Вход пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   * @returns Результат входа
   */
  static async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Находим пользователя по email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Проверяем пароль
      const isPasswordValid = await User.comparePassword(password, user.password || '');
      if (!isPasswordValid) {
        throw new Error('Неверный пароль');
      }

      // Проверяем статус пользователя
      if (user.status === 'blocked') {
        throw new Error('Пользователь заблокирован');
      }

      // Генерируем токены
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Обновляем дату последнего входа
      await User.update(user.id, {
        lastLoginAt: new Date(),
      } as any);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      logger.error(`Ошибка при входе пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Обновление токена доступа
   * @param refreshToken Токен обновления
   * @returns Новые токены
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Проверяем токен обновления
      const decoded = jwt.verify(refreshToken, env.jwt.secret) as TokenPayload;
      
      // Находим пользователя
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Генерируем новые токены
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return tokens;
    } catch (error) {
      logger.error(`Ошибка при обновлении токена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Подтверждение email пользователя
   * @param token Токен подтверждения
   * @returns Пользователь после подтверждения
   */
  static async verifyEmail(token: string): Promise<User> {
    try {
      // Находим пользователя по токену подтверждения
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        throw new Error('Недействительный токен подтверждения');
      }

      // Обновляем пользователя
      const updatedUser = {
        ...user,
        emailVerificationToken: undefined,
        emailVerified: true,
        status: 'active',
      };
      
      await User.update(user.id, updatedUser);
      
      return updatedUser;
    } catch (error) {
      logger.error(`Ошибка при подтверждении email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Запрос на сброс пароля
   * @param email Email пользователя
   * @returns true если запрос отправлен успешно
   */
  static async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Находим пользователя по email
      const user = await User.findByEmail(email);
      if (!user) {
        // Не сообщаем о несуществующем пользователе в целях безопасности
        return true;
      }

      // Генерируем токен сброса пароля
      const resetToken = uuidv4();
      const resetExpires = new Date(Date.now() + 3600000); // 1 час

      // Обновляем пользователя
      await User.update(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // В реальном приложении здесь отправка email с токеном

      return true;
    } catch (error) {
      logger.error(`Ошибка при запросе сброса пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Сброс пароля
   * @param token Токен сброса
   * @param newPassword Новый пароль
   * @returns Пользователь после сброса пароля
   */
  static async resetPassword(token: string, newPassword: string): Promise<User> {
    try {
      // Находим пользователя по токену сброса
      const user = await User.findOne({ passwordResetToken: token });
      if (!user) {
        throw new Error('Недействительный токен сброса');
      }

      // Проверяем срок действия токена
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        throw new Error('Истек срок действия токена сброса');
      }

      // Обновляем пароль пользователя
      const updatedUser = {
        ...user,
        password: newPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      };
      
      await User.update(user.id, updatedUser);
      
      return updatedUser;
    } catch (error) {
      logger.error(`Ошибка при сбросе пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Генерация токенов доступа и обновления
   * @param payload Полезная нагрузка для токенов
   * @returns Токены доступа и обновления
   */
  private static generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      payload, 
      env.jwt.secret, 
      { expiresIn: env.jwt.accessExpiresIn }
    );
    
    const refreshToken = jwt.sign(
      payload, 
      env.jwt.secret, 
      { expiresIn: env.jwt.refreshExpiresIn }
    );
    
    return { accessToken, refreshToken };
  }
}

export const authService = AuthService; 