import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import User, { UserCreationAttributes, UserStatus } from '../models/user.model';
import { getModuleLogger } from '../utils/logger';

const logger = getModuleLogger('AuthService');

// Интерфейс для данных токена
export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

// Интерфейс для результата аутентификации
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: any;
}

// Сервис для работы с аутентификацией
class AuthService {
  /**
   * Регистрация нового пользователя
   * @param userData Данные пользователя
   * @returns Результат регистрации
   */
  async register(userData: UserCreationAttributes): Promise<User> {
    try {
      // Проверяем, что пользователь с таким email не существует
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Генерируем токен для подтверждения email
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Создаем пользователя
      const user = await User.create({
        ...userData,
        emailVerificationToken,
        status: UserStatus.PENDING,
      });

      logger.info(`Пользователь зарегистрирован: ${user.email}`);

      return user;
    } catch (error) {
      logger.error(`Ошибка при регистрации пользователя: ${error.message}`);
      throw error;
    }
  }

  /**
   * Аутентификация пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   * @returns Результат аутентификации
   */
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Получаем пользователя по email с паролем
      const user = await User.scope('withPassword').findOne({ where: { email } });
      if (!user) {
        throw new Error('Неверные учетные данные');
      }

      // Проверяем пароль
      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        throw new Error('Неверные учетные данные');
      }

      // Проверяем статус пользователя
      if (user.status === UserStatus.BLOCKED) {
        throw new Error('Пользователь заблокирован');
      }

      if (user.status === UserStatus.DELETED) {
        throw new Error('Пользователь удален');
      }

      if (user.status === UserStatus.PENDING && !user.emailVerified) {
        throw new Error('Email не подтвержден');
      }

      // Обновляем время последнего входа
      user.lastLoginAt = new Date();
      await user.save();

      // Генерируем токены
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      logger.info(`Пользователь успешно вошел в систему: ${user.email}`);

      return {
        accessToken,
        refreshToken,
        user: user.toPublic(),
      };
    } catch (error) {
      logger.error(`Ошибка при входе пользователя: ${error.message}`);
      throw error;
    }
  }

  /**
   * Обновление токена доступа
   * @param refreshToken Токен обновления
   * @returns Новые токены
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    try {
      // Проверяем токен
      const payload = jwt.verify(refreshToken, env.jwt.secret) as TokenPayload;

      // Получаем пользователя
      const user = await User.findByPk(payload.userId);
      if (!user) {
        throw new Error('Пользователь не найден');
      }

      // Проверяем статус пользователя
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Пользователь не активен');
      }

      // Генерируем новые токены
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      logger.info(`Токен обновлен для пользователя: ${user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user.toPublic(),
      };
    } catch (error) {
      logger.error(`Ошибка при обновлении токена: ${error.message}`);
      throw error;
    }
  }

  /**
   * Подтверждение email пользователя
   * @param token Токен подтверждения
   * @returns Пользователь
   */
  async verifyEmail(token: string): Promise<User> {
    try {
      // Находим пользователя по токену подтверждения
      const user = await User.findOne({ where: { emailVerificationToken: token } });
      if (!user) {
        throw new Error('Неверный токен подтверждения');
      }

      // Обновляем статус пользователя
      user.emailVerified = true;
      user.status = UserStatus.ACTIVE;
      user.emailVerificationToken = null;
      await user.save();

      logger.info(`Email подтвержден для пользователя: ${user.email}`);

      return user;
    } catch (error) {
      logger.error(`Ошибка при подтверждении email: ${error.message}`);
      throw error;
    }
  }

  /**
   * Запрос на сброс пароля
   * @param email Email пользователя
   * @returns Токен сброса пароля
   */
  async requestPasswordReset(email: string): Promise<string> {
    try {
      // Находим пользователя по email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('Пользователь с таким email не найден');
      }

      // Генерируем токен сброса пароля
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 час
      await user.save();

      logger.info(`Запрошен сброс пароля для пользователя: ${user.email}`);

      return resetToken;
    } catch (error) {
      logger.error(`Ошибка при запросе сброса пароля: ${error.message}`);
      throw error;
    }
  }

  /**
   * Сброс пароля
   * @param token Токен сброса пароля
   * @param newPassword Новый пароль
   * @returns Пользователь
   */
  async resetPassword(token: string, newPassword: string): Promise<User> {
    try {
      // Находим пользователя по токену сброса пароля
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { $gt: new Date() }, // Проверяем, что токен не истек
        },
      });

      if (!user) {
        throw new Error('Неверный или истекший токен сброса пароля');
      }

      // Обновляем пароль
      user.password = newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      logger.info(`Пароль сброшен для пользователя: ${user.email}`);

      return user;
    } catch (error) {
      logger.error(`Ошибка при сбросе пароля: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация токена доступа
   * @param user Пользователь
   * @returns Токен доступа
   */
  private generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.accessExpiresIn,
    });
  }

  /**
   * Генерация токена обновления
   * @param user Пользователь
   * @returns Токен обновления
   */
  private generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });
  }
}

export const authService = new AuthService(); 