import { Request, Response } from 'express';
import Favorite from '../models/Favorite';
import { ApiError } from '../utils/ApiError';
import { LoggerService } from '../services/loggerService';

// Добавить объект в избранное
export const addToFavorites = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError('Пользователь не авторизован', 401);
        }

        const newFavorite = await Favorite.create({
            user: userId,
            property: propertyId,
        });

        await newFavorite.populate('property');

        res.status(201).json({
            success: true,
            data: newFavorite,
        });
    } catch (error: any) {
        // Если ошибка дублирования (объект уже в избранном)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Объект уже добавлен в избранное',
            });
        }

        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Ошибка сервера',
        });
    }
};

// Удалить объект из избранного
export const removeFromFavorites = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError('Пользователь не авторизован', 401);
        }

        const result = await Favorite.findOneAndDelete({
            user: userId,
            property: propertyId,
        });

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'Объект не найден в избранном',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Объект удален из избранного',
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Ошибка сервера',
        });
    }
};

// Получить список избранных объектов пользователя
export const getUserFavorites = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError('Пользователь не авторизован', 401);
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const favorites = await Favorite.find({ user: userId })
            .populate('property')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Favorite.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: favorites,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Ошибка сервера',
        });
    }
};

// Проверить, добавлен ли объект в избранное
export const checkIsFavorite = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError('Пользователь не авторизован', 401);
        }

        const favorite = await Favorite.findOne({
            user: userId,
            property: propertyId,
        });

        res.status(200).json({
            success: true,
            isFavorite: !!favorite,
        });
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: error.message || 'Ошибка сервера',
        });
    }
}; 