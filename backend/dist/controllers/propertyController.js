"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyController = void 0;
const Property_1 = require("../models/Property");
const validation_1 = require("../utils/validation");
const loggerService_1 = require("../services/loggerService");
exports.propertyController = {
    // Создание нового объекта недвижимости
    async createProperty(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!['admin', 'landlord'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const { title, description, address, city, price_per_day, property_type, bedrooms, bathrooms, max_guests, amenities, rules, images } = req.body;
            const property = await Property_1.PropertyModel.create({
                owner_id: req.user.id,
                title,
                description,
                address,
                city,
                price_per_day,
                property_type,
                bedrooms,
                bathrooms,
                max_guests,
                amenities: amenities || [],
                rules: rules || [],
                status: 'active'
            }, images);
            res.status(201).json(property);
        }
        catch (error) {
            if (error instanceof validation_1.ValidationError) {
                res.status(400).json({ error: error.message });
            }
            else {
                loggerService_1.LoggerService.error('Error creating property', {
                    error,
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    propertyData: req.body
                });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },
    // Получение списка объектов недвижимости
    async getProperties(req, res) {
        try {
            const { city, property_type, min_price, max_price, min_bedrooms, min_bathrooms, min_guests, amenities, page = 1, limit = 10 } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;
            const { data, error, count } = await Property_1.PropertyModel.findAll({
                start,
                end,
                filters: {
                    city: city,
                    property_type: property_type,
                    min_price: min_price ? Number(min_price) : undefined,
                    max_price: max_price ? Number(max_price) : undefined,
                    min_bedrooms: min_bedrooms ? Number(min_bedrooms) : undefined,
                    min_bathrooms: min_bathrooms ? Number(min_bathrooms) : undefined,
                    min_guests: min_guests ? Number(min_guests) : undefined,
                    amenities: amenities ? (Array.isArray(amenities)
                        ? amenities
                        : [amenities])
                        : undefined
                }
            });
            if (error)
                throw error;
            res.json({
                properties: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting properties', {
                error,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение детальной информации об объекте
    async getPropertyById(req, res) {
        try {
            const { id } = req.params;
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            res.json(property);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting property by id', {
                error,
                propertyId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Обновление объекта недвижимости
    async updateProperty(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const updatedProperty = await Property_1.PropertyModel.update(id, req.body);
            res.json(updatedProperty);
        }
        catch (error) {
            if (error instanceof validation_1.ValidationError) {
                res.status(400).json({ error: error.message });
            }
            else {
                loggerService_1.LoggerService.error('Error updating property', {
                    error,
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    propertyId: req.params.id,
                    updateData: req.body
                });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },
    // Удаление объекта недвижимости
    async deleteProperty(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            await Property_1.PropertyModel.delete(id);
            res.json({ message: 'Property deleted successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error deleting property', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                propertyId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Получение объектов недвижимости пользователя
    async getUserProperties(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { page = 1, limit = 10 } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;
            const { data, error, count } = await Property_1.PropertyModel.findAll({
                start,
                end,
                filters: {
                    owner_id: req.user.id
                }
            });
            if (error)
                throw error;
            res.json({
                properties: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting user properties', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Добавление изображений к объекту недвижимости
    async addPropertyImages(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const { images } = req.body;
            if (!images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ error: 'No images provided' });
            }
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            const newImages = await Property_1.PropertyModel.addPropertyImages(id, images);
            res.status(201).json(newImages);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error adding property images', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                propertyId: req.params.id,
                images: req.body.images
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Удаление изображения объекта недвижимости
    async deletePropertyImage(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id, imageId } = req.params;
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            // Проверяем, что изображение принадлежит этому объекту
            const propertyImage = property.images.find(img => img.id === imageId);
            if (!propertyImage) {
                return res.status(404).json({ error: 'Image not found for this property' });
            }
            await Property_1.PropertyModel.deletePropertyImage(imageId);
            res.json({ message: 'Image deleted successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error deleting property image', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                propertyId: req.params.id,
                imageId: req.params.imageId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    // Установка основного изображения объекта недвижимости
    async setPrimaryImage(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id, imageId } = req.params;
            const property = await Property_1.PropertyModel.findById(id);
            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }
            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }
            // Проверяем, что изображение принадлежит этому объекту
            const propertyImage = property.images.find(img => img.id === imageId);
            if (!propertyImage) {
                return res.status(404).json({ error: 'Image not found for this property' });
            }
            await Property_1.PropertyModel.setPrimaryImage(imageId, id);
            res.json({ message: 'Primary image set successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error setting primary image', {
                error,
                userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                propertyId: req.params.id,
                imageId: req.params.imageId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};
