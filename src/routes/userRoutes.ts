import { authenticate, authorize } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import userController from '../controllers/userController';
import * as userSchema from '../schemas/user.schema';
import { UserRole } from '../models/User';
import { createTypedRouter } from '../utils/routeUtils';

// Создаем типизированный маршрутизатор
const typedRouter = createTypedRouter();

// Получение информации о текущем пользователе
typedRouter.getAuth('/me', userController.getCurrentUser, authenticate);

// Получение информации о профиле
typedRouter.getAuth('/profile', userController.getProfile, authenticate);

// Обновление профиля
typedRouter.putAuth('/profile', userController.updateProfile, authenticate, validateRequest(userSchema.updateProfile));

// Удаление профиля
typedRouter.deleteAuth('/profile', userController.deleteProfile, authenticate);

// Маршруты для администраторов
// Получение списка всех пользователей
typedRouter.getAuth('/', userController.getAllUsers, authenticate, authorize(UserRole.ADMIN));

// Получение информации о конкретном пользователе
typedRouter.getAuth('/:id', userController.getUserById, authenticate, authorize(UserRole.ADMIN));

// Обновление пользователя администратором
typedRouter.putAuth('/:id', userController.updateUserById, authenticate, authorize(UserRole.ADMIN), validateRequest(userSchema.updateUser));

// Блокировка/разблокировка пользователя
typedRouter.patchAuth('/:id/status', userController.updateUserStatus, authenticate, authorize(UserRole.ADMIN), validateRequest(userSchema.updateUserStatus));

// Удаление пользователя
typedRouter.deleteAuth('/:id', userController.deleteUserById, authenticate, authorize(UserRole.ADMIN));

// Экспортируем маршрутизатор
export default typedRouter.getRouter(); 