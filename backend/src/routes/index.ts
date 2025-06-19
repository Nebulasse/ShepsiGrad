import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './userRoutes';
import propertyRoutes from './propertyRoutes';
import bookingRoutes from './bookingRoutes';
import favoriteRoutes from './favoriteRoutes';
import chatRoutes from './chatRoutes';
import notificationRoutes from './notificationRoutes';
import imageRoutes from './imageRoutes';
import mapRoutes from './mapRoutes';
import adminRoutes from './adminRoutes';
import reviewRoutes from './reviewRoutes';
// Импорты других маршрутов будут добавлены по мере разработки

const router = Router();

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты пользователей
router.use('/users', userRoutes);

// Маршруты объектов недвижимости
router.use('/properties', propertyRoutes);

// Маршруты бронирований
router.use('/bookings', bookingRoutes);

// Маршруты избранного
router.use('/favorites', favoriteRoutes);

// Маршруты чатов
router.use('/chats', chatRoutes);

// Маршруты уведомлений
router.use('/notifications', notificationRoutes);

// Маршруты для работы с изображениями
router.use('/images', imageRoutes);

// Маршруты для работы с картами
router.use('/maps', mapRoutes);

// Маршруты администратора
router.use('/admin', adminRoutes);

// Маршруты отзывов
router.use('/reviews', reviewRoutes);

// Другие маршруты будут добавлены по мере разработки
// router.use('/properties', propertyRoutes);
// router.use('/bookings', bookingRoutes);
// и т.д.

export default router; 