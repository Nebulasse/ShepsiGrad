import { Request, Response } from 'express';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest, wrapAuthHandler } from '../middleware/auth.middleware';
import { AppDataSource } from '../database/connection';
import { User } from '../models/User';

const logger = getModuleLogger('UserController');

class UserController {
  /**
   * Получение информации о текущем пользователе
   */
  getCurrentUser = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

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
   * Получение профиля пользователя
   */
  getProfile = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: req.user.id },
        select: [
          'id', 'email', 'firstName', 'lastName', 'phoneNumber',
          'role', 'profileImage', 'emailVerified', 'createdAt', 'updatedAt'
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Ошибка при получении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении профиля пользователя'
      });
    }
  });

  /**
   * Обновление профиля пользователя
   */
  updateProfile = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const { firstName, lastName, phoneNumber, profileImage } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.user.id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Обновляем поля пользователя
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.profileImage = profileImage || user.profileImage;
      user.updatedAt = new Date();

      await userRepository.save(user);

      // Удаляем чувствительные данные из ответа
      const { password, refreshToken, ...userWithoutSensitiveData } = user;

      return res.status(200).json({
        success: true,
        message: 'Профиль успешно обновлен',
        data: userWithoutSensitiveData
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении профиля пользователя'
      });
    }
  });

  /**
   * Удаление профиля пользователя
   */
  deleteProfile = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: req.user.id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Мягкое удаление - деактивация аккаунта
      user.isActive = false;
      user.updatedAt = new Date();
      await userRepository.save(user);

      return res.status(200).json({
        success: true,
        message: 'Профиль успешно деактивирован'
      });
    } catch (error) {
      logger.error(`Ошибка при удалении профиля: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при деактивации профиля пользователя'
      });
    }
  });

  /**
   * Получение списка всех пользователей (для админа)
   */
  getAllUsers = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const userRepository = AppDataSource.getRepository(User);
      
      // Получаем общее количество пользователей
      const total = await userRepository.count();
      
      // Получаем пользователей с пагинацией
      const users = await userRepository.find({
        select: [
          'id', 'email', 'firstName', 'lastName', 'phoneNumber',
          'role', 'profileImage', 'isActive', 'emailVerified', 'createdAt', 'updatedAt'
        ],
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      return res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Ошибка при получении списка пользователей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении списка пользователей'
      });
    }
  });

  /**
   * Получение информации о конкретном пользователе (для админа)
   */
  getUserById = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const { id } = req.params;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id },
        select: [
          'id', 'email', 'firstName', 'lastName', 'phoneNumber',
          'role', 'profileImage', 'isActive', 'emailVerified', 'createdAt', 'updatedAt'
        ]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Ошибка при получении информации о пользователе: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении информации о пользователе'
      });
    }
  });

  /**
   * Обновление пользователя администратором
   */
  updateUserById = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const { id } = req.params;
      const { firstName, lastName, phoneNumber, email, role, isActive } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Обновляем поля пользователя
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (email) user.email = email;
      if (role !== undefined) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
      user.updatedAt = new Date();

      await userRepository.save(user);

      // Удаляем чувствительные данные из ответа
      const { password, refreshToken, ...userWithoutSensitiveData } = user;

      return res.status(200).json({
        success: true,
        message: 'Пользователь успешно обновлен',
        data: userWithoutSensitiveData
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении пользователя'
      });
    }
  });

  /**
   * Обновление статуса пользователя (блокировка/разблокировка)
   */
  updateUserStatus = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Необходимо указать статус пользователя'
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Обновляем статус пользователя
      user.isActive = isActive;
      user.updatedAt = new Date();

      await userRepository.save(user);

      return res.status(200).json({
        success: true,
        message: isActive ? 'Пользователь разблокирован' : 'Пользователь заблокирован'
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении статуса пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении статуса пользователя'
      });
    }
  });

  /**
   * Удаление пользователя администратором
   */
  deleteUserById = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Требуется аутентификация'
        });
      }

      const { id } = req.params;

      // Проверяем, не пытается ли админ удалить самого себя
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Вы не можете удалить собственный аккаунт через этот метод'
        });
      }

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Мягкое удаление - деактивация аккаунта
      user.isActive = false;
      user.updatedAt = new Date();
      await userRepository.save(user);

      return res.status(200).json({
        success: true,
        message: 'Пользователь успешно деактивирован'
      });
    } catch (error) {
      logger.error(`Ошибка при удалении пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при удалении пользователя'
      });
    }
  });
}

export default new UserController(); 