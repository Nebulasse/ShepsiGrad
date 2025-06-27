import { Request, Response } from 'express';
import { ImageService, ImageSize, ImageFormat } from '../services/imageService';
import { LoggerService } from '../services/loggerService';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';

// Настройка multer для обработки загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];
        
        if (!allowedTypes.includes(file.mimetype)) {
            cb(new Error('Unsupported file type'));
            return;
        }
        
        cb(null, true);
    }
});

export const uploadMiddleware = upload.single('image');

export const imageController = {
    async uploadImage(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            // Проверяем, есть ли файл
            if (!req.file) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            const file = req.file;
            const fileName = file.originalname;
            
            // Получаем параметры из запроса или используем дефолтные
            const quality = req.body.quality ? parseInt(req.body.quality) : 80;
            const generateSizes = req.body.sizes ? 
                req.body.sizes.split(',').map((size: string) => size.trim()) as ImageSize[] : 
                [ImageSize.THUMBNAIL, ImageSize.MEDIUM, ImageSize.LARGE];
            const generateFormats = req.body.formats ? 
                req.body.formats.split(',').map((format: string) => format.trim()) as ImageFormat[] : 
                [ImageFormat.WEBP, ImageFormat.JPEG];
                
            // Обрабатываем и загружаем изображение
            const imageUrls = await ImageService.uploadAndOptimizeImage(
                file.buffer,
                fileName,
                {
                    generateSizes,
                    generateFormats,
                    quality
                }
            );
            
            res.status(201).json({
                message: 'Image uploaded successfully',
                urls: imageUrls
            });
        } catch (error: any) {
            LoggerService.error('Error uploading image', { error, userId: req.user?.id });
            res.status(500).json({ error: error.message || 'Error uploading image' });
        }
    },
    
    async deleteImage(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            const { fileId } = req.params;
            
            if (!fileId) {
                return res.status(400).json({ error: 'File ID is required' });
            }
            
            await ImageService.deleteImage(fileId);
            
            res.json({
                message: 'Image deleted successfully'
            });
        } catch (error: any) {
            LoggerService.error('Error deleting image', { error, userId: req.user?.id });
            res.status(500).json({ error: error.message || 'Error deleting image' });
        }
    }
}; 