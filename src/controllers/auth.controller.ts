import { Request, Response } from 'express';
import { getModuleLogger } from '../utils/logger';
import { AuthService, RegisterUserData, LoginUserData } from '../services/auth.service';
import { AuthenticatedRequest, wrapAuthHandler } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import * as authSchema from '../schemas/auth.schema';

const logger = getModuleLogger('AuthController');
const authService = new AuthService();

// Интерфейс для запроса с аутентифицированным пользователем
export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}

class AuthController {
  /**
   * Регистрация нового пользователя
   */
  register = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userData: RegisterUserData = req.body;
      const user = await authService.register(userData);
      // Генерируем accessToken
      const tokens = authService['generateTokens']({ id: user.id, role: user.role });
      return res.status(201).json({
        success: true,
        message: 'Пользователь успешно зарегистрирован',
        data: {
          user,
          token: tokens.accessToken
        }
      });
    } catch (error) {
      logger.error(`Ошибка при регистрации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      if (error instanceof Error && error.message.includes('уже существует')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Ошибка при регистрации пользователя'
      });
    }
  };

  /**
   * Аутентификация пользователя
   */
  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const credentials: LoginUserData = req.body;
      const { user, tokens } = await authService.login(credentials);

      // Устанавливаем refresh token в httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
      });

      return res.status(200).json({
        success: true,
        message: 'Вход выполнен успешно',
        data: {
          user,
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      logger.error(`Ошибка при входе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      if (error instanceof Error && (error.message.includes('Неверный') || error.message.includes('деактивирован'))) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Ошибка при входе в систему'
      });
    }
  };

  /**
   * Обновление токенов
   */
  refreshTokens = async (req: Request, res: Response): Promise<Response> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Отсутствует refresh token'
        });
      }

      const tokens = await authService.refreshTokens(refreshToken);

      // Обновляем refresh token в cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
      });

      return res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken
        }
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении токенов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      return res.status(401).json({
        success: false,
        message: 'Невалидный refresh token'
      });
    }
  };

  /**
   * Выход пользователя
   */
  logout = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      await authService.logout(req.user.id);

      // Удаляем refresh token из cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: 'Выход выполнен успешно'
      });
    } catch (error) {
      logger.error(`Ошибка при выходе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      return res.status(500).json({
        success: false,
        message: 'Ошибка при выходе из системы'
      });
    }
  });

  /**
   * Получение информации о текущем пользователе
   */
  getCurrentUser = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      return res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      logger.error(`Ошибка при получении данных пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении данных пользователя'
      });
    }
  });

  /**
   * Подтверждение email
   */
  verifyEmail = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Отсутствует токен подтверждения'
        });
      }

      await authService.verifyEmail(token);

      return res.status(200).json({
        success: true,
        message: 'Email успешно подтвержден'
      });
    } catch (error) {
      logger.error(`Ошибка при подтверждении email: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      if (error instanceof Error && error.message.includes('токен')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Ошибка при подтверждении email'
      });
    }
  };

  /**
   * Запрос на сброс пароля
   */
  requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email обязателен'
        });
      }

      await authService.requestPasswordReset(email);

      return res.status(200).json({
        success: true,
        message: 'Инструкции по сбросу пароля отправлены на указанный email'
      });
    } catch (error) {
      logger.error(`Ошибка при запросе сброса пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      return res.status(500).json({
        success: false,
        message: 'Ошибка при запросе сброса пароля'
      });
    }
  };

  /**
   * Сброс пароля
   */
  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Токен и новый пароль обязательны'
        });
      }

      await authService.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: 'Пароль успешно изменен'
      });
    } catch (error) {
      logger.error(`Ошибка при сбросе пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      
      if (error instanceof Error && error.message.includes('токен')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Ошибка при сбросе пароля'
      });
    }
  };

  /**
   * Повторная отправка письма для подтверждения email
   */
  resendVerification = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      // TODO: Реализовать повторную отправку письма для подтверждения email
      
      return res.status(200).json({
        success: true,
        message: 'Письмо для подтверждения email отправлено повторно'
      });
    } catch (error) {
      logger.error(`Ошибка при повторной отправке письма: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при повторной отправке письма для подтверждения email'
      });
    }
  })

  /**
   * Изменение пароля
   */
  changePassword = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // TODO: Реализовать изменение пароля
      
      return res.status(200).json({
        success: true,
        message: 'Пароль успешно изменен'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      logger.error(`Ошибка при изменении пароля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при изменении пароля'
      });
    }
  })

  /**
   * Аутентификация через социальные сети
   */
  socialAuth = async (req: Request, res: Response) => {
    try {
      const { provider, token, userData } = req.body;
      
      // TODO: Реализовать аутентификацию через социальные сети
      
      return res.status(200).json({
        success: true,
        message: 'Аутентификация через социальную сеть выполнена успешно',
        data: {
          user: {},
          accessToken: '',
          expiresIn: 3600
        }
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      logger.error(`Ошибка при аутентификации через соцсеть: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при аутентификации через социальную сеть'
      });
    }
  }
}

export default new AuthController(); 