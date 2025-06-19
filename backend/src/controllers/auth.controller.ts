import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { getModuleLogger } from '../utils/logger';
import { UserCreationAttributes } from '../models/user.model';

const logger = getModuleLogger('AuthController');

/**
 * Контроллер для обработки запросов аутентификации
 */
class AuthController {
  /**
   * Регистрация нового пользователя
   * @route POST /api/auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData = req.body as UserCreationAttributes;
      const user = await authService.register(userData);

      // Отправляем только публичные данные пользователя
      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: user.toPublic(),
      });
    } catch (error) {
      logger.error(`Ошибка при регистрации: ${error.message}`);
      
      if (error.message === 'Пользователь с таким email уже существует') {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
      }
    }
  }

  /**
   * Вход пользователя
   * @route POST /api/auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const authResult = await authService.login(email, password);

      res.status(200).json({
        message: 'Вход выполнен успешно',
        ...authResult,
      });
    } catch (error) {
      logger.error(`Ошибка при входе: ${error.message}`);
      
      if (
        error.message === 'Неверные учетные данные' ||
        error.message === 'Пользователь заблокирован' ||
        error.message === 'Пользователь удален' ||
        error.message === 'Email не подтвержден'
      ) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Ошибка при входе в систему' });
      }
    }
  }

  /**
   * Обновление токена доступа
   * @route POST /api/auth/refresh-token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const authResult = await authService.refreshToken(refreshToken);

      res.status(200).json({
        message: 'Токен успешно обновлен',
        ...authResult,
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении токена: ${error.message}`);
      
      if (
        error.name === 'JsonWebTokenError' ||
        error.name === 'TokenExpiredError' ||
        error.message === 'Пользователь не найден' ||
        error.message === 'Пользователь не активен'
      ) {
        res.status(401).json({ message: 'Неверный или истекший токен' });
      } else {
        res.status(500).json({ message: 'Ошибка при обновлении токена' });
      }
    }
  }

  /**
   * Подтверждение email пользователя
   * @route GET /api/auth/verify-email/:token
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const user = await authService.verifyEmail(token);

      res.status(200).json({
        message: 'Email успешно подтвержден',
        user: user.toPublic(),
      });
    } catch (error) {
      logger.error(`Ошибка при подтверждении email: ${error.message}`);
      
      if (error.message === 'Неверный токен подтверждения') {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Ошибка при подтверждении email' });
      }
    }
  }

  /**
   * Запрос на сброс пароля
   * @route POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);

      // Не сообщаем, существует ли пользователь с таким email
      res.status(200).json({
        message: 'Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены на указанный адрес',
      });
    } catch (error) {
      logger.error(`Ошибка при запросе сброса пароля: ${error.message}`);
      
      // Всегда возвращаем успешный ответ, чтобы не раскрывать информацию о существовании пользователя
      res.status(200).json({
        message: 'Если пользователь с таким email существует, инструкции по сбросу пароля будут отправлены на указанный адрес',
      });
    }
  }

  /**
   * Сброс пароля
   * @route POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;
      const user = await authService.resetPassword(token, password);

      res.status(200).json({
        message: 'Пароль успешно изменен',
        user: user.toPublic(),
      });
    } catch (error) {
      logger.error(`Ошибка при сбросе пароля: ${error.message}`);
      
      if (error.message === 'Неверный или истекший токен сброса пароля') {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Ошибка при сбросе пароля' });
      }
    }
  }

  /**
   * Получение текущего пользователя
   * @route GET /api/auth/me
   */
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Пользователь уже добавлен в объект запроса middleware authenticate
      if (!req.user) {
        res.status(401).json({ message: 'Требуется аутентификация' });
        return;
      }

      res.status(200).json({
        user: req.user.toPublic(),
      });
    } catch (error) {
      logger.error(`Ошибка при получении текущего пользователя: ${error.message}`);
      res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
  }
}

export const authController = new AuthController(); 