import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/User';
import { AppDataSource } from '../database/connection';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { getModuleLogger } from '../utils/logger';
import { AuthProvider } from '../models/enums/AuthProvider';
import { EmailService } from './email.service';

const logger = getModuleLogger('AuthService');
const emailService = new EmailService();

/**
 * Данные для регистрации пользователя
 */
interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phoneNumber?: string;
}

/**
 * Данные для аутентификации через социальные сети
 */
interface SocialAuthUserData {
  firstName: string;
  lastName: string;
  email: string;
  provider: AuthProvider;
  providerId: string;
  profileImage?: string;
}

/**
 * Полезная нагрузка токена
 */
interface TokenPayload {
  id: string;
  role: UserRole;
}

/**
 * Ответ с токенами
 */
interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Регистрация нового пользователя
   */
  async register(userData: RegisterUserData): Promise<User> {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await this.userRepository.findOne({ 
        where: { email: userData.email } 
      });

      if (existingUser) {
        throw new ApiError('Пользователь с таким email уже существует', 400);
      }

      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Создаем нового пользователя
      const user = this.userRepository.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || UserRole.USER,
        phoneNumber: userData.phoneNumber,
        provider: AuthProvider.LOCAL,
        emailVerified: false,
        isActive: true
      });

      // Сохраняем пользователя в базу данных
      await this.userRepository.save(user);
      
      // Генерируем токен для подтверждения email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = verificationToken;
      user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
      
      await this.userRepository.save(user);
      
      // Отправляем email с подтверждением
      await this.sendVerificationEmail(user.email, verificationToken);
      
      // Удаляем пароль из ответа
      const { password, ...userWithoutPassword } = user;
      
      return userWithoutPassword as User;
    } catch (error) {
      logger.error(`Ошибка при регистрации пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Аутентификация пользователя
   */
  async login(email: string, password: string): Promise<{ user: User; tokens: TokenResponse }> {
    try {
      // Ищем пользователя по email
      const user = await this.userRepository.findOne({ 
        where: { email },
        select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'isActive'] 
      });

      if (!user) {
        throw new ApiError('Неверный email или пароль', 401);
      }

      // Проверяем пароль
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new ApiError('Неверный email или пароль', 401);
      }

      if (!user.isActive) {
        throw new ApiError('Аккаунт деактивирован', 403);
      }

      // Генерируем токены
      const tokens = this.generateTokens({ id: user.id, role: user.role });

      // Обновляем refresh token в базе данных
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      // Удаляем пароль и refreshToken из ответа
      const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

      return {
        user: userWithoutSensitiveData as User,
        tokens
      };
    } catch (error) {
      logger.error(`Ошибка при входе пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Обновление токена доступа
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Проверяем валидность refresh token
      const decoded = jwt.verify(refreshToken, env.jwt.secret) as TokenPayload;

      // Ищем пользователя с таким refresh token
      const user = await this.userRepository.findOne({ 
        where: { id: decoded.id, refreshToken }
      });

      if (!user) {
        throw new ApiError('Недействительный refresh token', 401);
      }

      if (!user.isActive) {
        throw new ApiError('Аккаунт деактивирован', 403);
      }

      // Генерируем новые токены
      const tokens = this.generateTokens({ id: user.id, role: user.role });

      // Обновляем refresh token в базе данных
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      return tokens;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError('Недействительный refresh token', 401);
      }
      logger.error(`Ошибка при обновлении токена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Подтверждение email
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      // Ищем пользователя с таким токеном подтверждения email
      const user = await this.userRepository.findOne({ 
        where: { resetPasswordToken: token } 
      });

      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new ApiError('Невалидный или истекший токен подтверждения', 400);
      }

      // Подтверждаем email
      user.emailVerified = true;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      logger.error(`Ошибка при подтверждении email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Запрос на сброс пароля
   */
  async requestPasswordReset(email: string): Promise<boolean> {
    try {
      // Ищем пользователя по email
      const user = await this.userRepository.findOne({ 
        where: { email } 
      });

      if (!user) {
        // Не сообщаем, что пользователь не существует (защита от перебора)
        return true;
      }

      // Генерируем токен для сброса пароля
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 час

      // Обновляем данные пользователя
      await this.userRepository.save(user);

      // Отправляем email со ссылкой для сброса пароля
      await this.sendPasswordResetEmail(user.email, resetToken);

      return true;
    } catch (error) {
      logger.error(`Ошибка при запросе сброса пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Сброс пароля
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      // Ищем пользователя с таким токеном сброса пароля
      const user = await this.userRepository.findOne({ 
        where: { resetPasswordToken: token } 
      });

      if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
        throw new ApiError('Невалидный или истекший токен сброса пароля', 400);
      }

      // Хешируем новый пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Обновляем пароль и сбрасываем токен
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      logger.error(`Ошибка при сбросе пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Отправка email для подтверждения почты
   */
  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${env.app.frontendUrl}/verify-email?token=${token}`;
    
    await emailService.sendEmail({
      to: email,
      subject: 'Подтверждение email',
      html: `<p>Пожалуйста, подтвердите ваш email, перейдя по ссылке: <a href="${verificationUrl}">${verificationUrl}</a></p>`
    });
  }

  /**
   * Отправка email для сброса пароля
   */
  private async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${env.app.frontendUrl}/reset-password?token=${token}`;
    
    await emailService.sendEmail({
      to: email,
      subject: 'Сброс пароля',
      html: `<p>Вы запросили сброс пароля. Перейдите по ссылке для установки нового пароля: <a href="${resetUrl}">${resetUrl}</a></p>
             <p>Если вы не запрашивали сброс пароля, проигнорируйте это сообщение.</p>`
    });
  }

  /**
   * Генерация токенов доступа и обновления
   */
  private generateTokens(payload: TokenPayload): TokenResponse {
    const options: SignOptions = {
      expiresIn: env.jwt.accessExpiresIn
    };
    
    const accessToken = jwt.sign(payload, env.jwt.secret, options);
    
    const refreshOptions: SignOptions = {
      expiresIn: env.jwt.refreshExpiresIn
    };
    
    const refreshToken = jwt.sign(payload, env.jwt.secret, refreshOptions);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(env.jwt.accessExpiresIn)
    };
  }

  /**
   * Получение времени истечения токена в секундах
   */
  private getTokenExpirationTime(expiresIn: string): number {
    const unit = expiresIn.charAt(expiresIn.length - 1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 3600; // По умолчанию 1 час
    }
  }

  /**
   * Аутентификация через социальные сети
   */
  async socialAuth(userData: SocialAuthUserData): Promise<{ user: User; tokens: TokenResponse }> {
    try {
      // Ищем пользователя по email и провайдеру
      let user = await this.userRepository.findOne({ 
        where: [
          { email: userData.email, provider: userData.provider },
          { email: userData.email }
        ]
      });

      if (!user) {
        // Если пользователь не найден, создаем нового
        user = this.userRepository.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          provider: userData.provider,
          providerId: userData.providerId,
          profileImage: userData.profileImage,
          role: UserRole.USER,
          emailVerified: true, // Для социальных сетей считаем email подтвержденным
          isActive: true
        });
      } else {
        // Если пользователь найден, обновляем данные
        user.firstName = userData.firstName || user.firstName;
        user.lastName = userData.lastName || user.lastName;
        user.profileImage = userData.profileImage || user.profileImage;
        user.provider = userData.provider;
        user.providerId = userData.providerId;
        user.emailVerified = true;
      }

      await this.userRepository.save(user);

      // Генерируем токены
      const tokens = this.generateTokens({ id: user.id, role: user.role });

      // Обновляем refresh token в базе данных
      user.refreshToken = tokens.refreshToken;
      await this.userRepository.save(user);

      // Удаляем чувствительные данные из ответа
      const { password, refreshToken, ...userWithoutSensitiveData } = user;

      return {
        user: userWithoutSensitiveData as User,
        tokens
      };
    } catch (error) {
      logger.error(`Ошибка при аутентификации через соцсети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Выход пользователя
   */
  async logout(userId: string): Promise<boolean> {
    try {
      // Находим пользователя
      const user = await this.userRepository.findOne({ 
        where: { id: userId } 
      });

      if (!user) {
        throw new ApiError('Пользователь не найден', 404);
      }

      // Очищаем refresh token
      user.refreshToken = null;
      await this.userRepository.save(user);

      return true;
    } catch (error) {
      logger.error(`Ошибка при выходе пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService; 