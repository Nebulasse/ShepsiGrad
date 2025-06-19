import { Response } from 'express';
import { PropertyModel } from '../models/Property';
import { AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';
import { LoggerService } from '../services/loggerService';

export const propertyController = {
    // Создание нового объекта недвижимости
    async createProperty(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            if (!['admin', 'landlord'].includes(req.user.role)) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const {
                title,
                description,
                address,
                city,
                price_per_day,
                property_type,
                bedrooms,
                bathrooms,
                max_guests,
                amenities,
                rules,
                images
            } = req.body;

            const property = await PropertyModel.create({
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
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                LoggerService.error('Error creating property', { 
                    error, 
                    userId: req.user?.id,
                    propertyData: req.body
                });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    // Получение списка объектов недвижимости
    async getProperties(req: AuthRequest, res: Response) {
        try {
            const { 
                city, 
                property_type, 
                min_price, 
                max_price,
                min_bedrooms,
                min_bathrooms,
                min_guests,
                amenities,
                page = 1,
                limit = 10
            } = req.query;

            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;

            const { data, error, count } = await PropertyModel.findAll({
                start,
                end,
                filters: {
                    city: city as string,
                    property_type: property_type as string,
                    min_price: min_price ? Number(min_price) : undefined,
                    max_price: max_price ? Number(max_price) : undefined,
                    min_bedrooms: min_bedrooms ? Number(min_bedrooms) : undefined,
                    min_bathrooms: min_bathrooms ? Number(min_bathrooms) : undefined,
                    min_guests: min_guests ? Number(min_guests) : undefined,
                    amenities: amenities ? (Array.isArray(amenities) 
                        ? amenities as string[] 
                        : [amenities as string]) 
                        : undefined
                }
            });

            if (error) throw error;

            res.json({
                properties: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        } catch (error) {
            LoggerService.error('Error getting properties', { 
                error,
                query: req.query
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение детальной информации об объекте
    async getPropertyById(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const property = await PropertyModel.findById(id);

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            res.json(property);
        } catch (error) {
            LoggerService.error('Error getting property by id', { 
                error,
                propertyId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Обновление объекта недвижимости
    async updateProperty(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const property = await PropertyModel.findById(id);

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const updatedProperty = await PropertyModel.update(id, req.body);
            res.json(updatedProperty);
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                LoggerService.error('Error updating property', { 
                    error,
                    userId: req.user?.id,
                    propertyId: req.params.id,
                    updateData: req.body
                });
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    },

    // Удаление объекта недвижимости
    async deleteProperty(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const property = await PropertyModel.findById(id);

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            await PropertyModel.delete(id);
            res.json({ message: 'Property deleted successfully' });
        } catch (error) {
            LoggerService.error('Error deleting property', { 
                error,
                userId: req.user?.id,
                propertyId: req.params.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Получение объектов недвижимости пользователя
    async getUserProperties(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { page = 1, limit = 10 } = req.query;
            const start = (Number(page) - 1) * Number(limit);
            const end = start + Number(limit) - 1;

            const { data, error, count } = await PropertyModel.findAll({
                start,
                end,
                filters: {
                    owner_id: req.user.id
                }
            });

            if (error) throw error;

            res.json({
                properties: data,
                total: count,
                page: Number(page),
                limit: Number(limit)
            });
        } catch (error) {
            LoggerService.error('Error getting user properties', { 
                error,
                userId: req.user?.id
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Добавление изображений к объекту недвижимости
    async addPropertyImages(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const { images } = req.body;

            if (!images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({ error: 'No images provided' });
            }

            const property = await PropertyModel.findById(id);

            if (!property) {
                return res.status(404).json({ error: 'Property not found' });
            }

            if (property.owner_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const newImages = await PropertyModel.addPropertyImages(id, images);
            res.status(201).json(newImages);
        } catch (error) {
            LoggerService.error('Error adding property images', { 
                error,
                userId: req.user?.id,
                propertyId: req.params.id,
                images: req.body.images
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Удаление изображения объекта недвижимости
    async deletePropertyImage(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, imageId } = req.params;
            const property = await PropertyModel.findById(id);

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

            await PropertyModel.deletePropertyImage(imageId);
            res.json({ message: 'Image deleted successfully' });
        } catch (error) {
            LoggerService.error('Error deleting property image', { 
                error,
                userId: req.user?.id,
                propertyId: req.params.id,
                imageId: req.params.imageId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    // Установка основного изображения объекта недвижимости
    async setPrimaryImage(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id, imageId } = req.params;
            const property = await PropertyModel.findById(id);

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

            await PropertyModel.setPrimaryImage(imageId, id);
            res.json({ message: 'Primary image set successfully' });
        } catch (error) {
            LoggerService.error('Error setting primary image', { 
                error,
                userId: req.user?.id,
                propertyId: req.params.id,
                imageId: req.params.imageId
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}; 