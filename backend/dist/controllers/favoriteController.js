"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Favorite_1 = __importDefault(require("../models/Favorite"));
const logger_1 = require("../utils/logger");
const logger = (0, logger_1.getModuleLogger)('FavoriteController');
// Контроллер для работы с избранными объектами
const favoriteController = {
    // Добавить объект в избранное
    addToFavorites: async (req, res) => {
        try {
            const { propertyId } = req.body;
            const userId = req.user.user_id;
            // Проверяем, есть ли уже такой объект в избранном
            const existingFavorite = await Favorite_1.default.findOne({
                where: { userId, propertyId }
            });
            if (existingFavorite) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Объект уже добавлен в избранное'
                });
            }
            // Создаем запись в избранном
            const favorite = await Favorite_1.default.create({
                userId,
                propertyId
            });
            return res.status(201).json({
                status: 'success',
                message: 'Объект добавлен в избранное',
                data: { favorite }
            });
        }
        catch (error) {
            logger.error(`Ошибка при добавлении в избранное: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            return res.status(500).json({
                status: 'error',
                message: 'Ошибка при добавлении объекта в избранное'
            });
        }
    },
    // Удалить объект из избранного
    removeFromFavorites: async (req, res) => {
        try {
            const { propertyId } = req.params;
            const userId = req.user.user_id;
            const favorite = await Favorite_1.default.findOne({
                where: { userId, propertyId }
            });
            if (!favorite) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Объект не найден в избранном'
                });
            }
            await favorite.destroy();
            return res.status(200).json({
                status: 'success',
                message: 'Объект удален из избранного'
            });
        }
        catch (error) {
            logger.error(`Ошибка при удалении из избранного: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            return res.status(500).json({
                status: 'error',
                message: 'Ошибка при удалении объекта из избранного'
            });
        }
    },
    // Получить список избранных объектов пользователя
    getUserFavorites: async (req, res) => {
        try {
            const userId = req.user.user_id;
            const favorites = await Favorite_1.default.findAll({
                where: { userId },
                include: ['property'] // Включаем связанные данные о недвижимости
            });
            return res.status(200).json({
                status: 'success',
                data: { favorites }
            });
        }
        catch (error) {
            logger.error(`Ошибка при получении избранного: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            return res.status(500).json({
                status: 'error',
                message: 'Ошибка при получении списка избранного'
            });
        }
    },
    // Проверить, находится ли объект в избранном
    checkIsFavorite: async (req, res) => {
        try {
            const { propertyId } = req.params;
            const userId = req.user.user_id;
            const favorite = await Favorite_1.default.findOne({
                where: { userId, propertyId }
            });
            return res.status(200).json({
                status: 'success',
                data: { isFavorite: !!favorite }
            });
        }
        catch (error) {
            logger.error(`Ошибка при проверке избранного: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            return res.status(500).json({
                status: 'error',
                message: 'Ошибка при проверке избранного'
            });
        }
    }
};
exports.default = favoriteController;
