"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageController = exports.uploadMiddleware = void 0;
const imageService_1 = require("../services/imageService");
const loggerService_1 = require("../services/loggerService");
const multer_1 = __importDefault(require("multer"));
// Настройка multer для обработки загрузки файлов
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
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
exports.uploadMiddleware = upload.single('image');
exports.imageController = {
    async uploadImage(req, res) {
        var _a;
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
                req.body.sizes.split(',').map((size) => size.trim()) :
                [imageService_1.ImageSize.THUMBNAIL, imageService_1.ImageSize.MEDIUM, imageService_1.ImageSize.LARGE];
            const generateFormats = req.body.formats ?
                req.body.formats.split(',').map((format) => format.trim()) :
                [imageService_1.ImageFormat.WEBP, imageService_1.ImageFormat.JPEG];
            // Обрабатываем и загружаем изображение
            const imageUrls = await imageService_1.ImageService.uploadAndOptimizeImage(file.buffer, fileName, {
                generateSizes,
                generateFormats,
                quality
            });
            res.status(201).json({
                message: 'Image uploaded successfully',
                urls: imageUrls
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error uploading image', { error, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            res.status(500).json({ error: error.message || 'Error uploading image' });
        }
    },
    async deleteImage(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { fileId } = req.params;
            if (!fileId) {
                return res.status(400).json({ error: 'File ID is required' });
            }
            await imageService_1.ImageService.deleteImage(fileId);
            res.json({
                message: 'Image deleted successfully'
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error deleting image', { error, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            res.status(500).json({ error: error.message || 'Error deleting image' });
        }
    }
};
