"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageService = exports.ImageFormat = exports.ImageSize = void 0;
const supabase_1 = require("../config/supabase");
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const loggerService_1 = require("./loggerService");
var ImageSize;
(function (ImageSize) {
    ImageSize["THUMBNAIL"] = "thumbnail";
    ImageSize["MEDIUM"] = "medium";
    ImageSize["LARGE"] = "large";
    ImageSize["ORIGINAL"] = "original";
})(ImageSize || (exports.ImageSize = ImageSize = {}));
var ImageFormat;
(function (ImageFormat) {
    ImageFormat["JPEG"] = "jpeg";
    ImageFormat["WEBP"] = "webp";
    ImageFormat["AVIF"] = "avif";
})(ImageFormat || (exports.ImageFormat = ImageFormat = {}));
class ImageService {
    /**
     * Оптимизирует и загружает изображение в хранилище
     */
    static async uploadAndOptimizeImage(file, fileName, options = {}) {
        try {
            const { generateSizes = [ImageSize.THUMBNAIL, ImageSize.MEDIUM, ImageSize.LARGE], generateFormats = [ImageFormat.WEBP, ImageFormat.JPEG], quality = 80 } = options;
            // Валидация файла
            const fileExt = path_1.default.extname(fileName).toLowerCase();
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            if (!allowedExtensions.includes(fileExt)) {
                throw new Error('Unsupported file format');
            }
            // Уникальный идентификатор для имени файла
            const fileId = (0, uuid_1.v4)();
            const imageUrls = {};
            // Получаем метаданные изображения
            const metadata = await (0, sharp_1.default)(file).metadata();
            // Создаем и загружаем разные размеры и форматы
            const uploadPromises = [];
            for (const size of generateSizes) {
                for (const format of generateFormats) {
                    uploadPromises.push(this.processAndUpload(file, fileId, {
                        size,
                        format,
                        quality
                    }, metadata)
                        .then(url => {
                        const key = `${size}_${format}`;
                        imageUrls[key] = url;
                    }));
                }
            }
            // Загружаем оригинал
            uploadPromises.push(this.uploadOriginal(file, fileId, fileExt)
                .then(url => {
                imageUrls['original'] = url;
            }));
            await Promise.all(uploadPromises);
            return imageUrls;
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error uploading and optimizing image', { error });
            throw error;
        }
    }
    /**
     * Удаление изображения и всех его вариаций
     */
    static async deleteImage(fileId) {
        try {
            const { data: files, error } = await supabase_1.supabase
                .storage
                .from(this.BUCKET_NAME)
                .list('', {
                search: fileId
            });
            if (error)
                throw error;
            if (files && files.length > 0) {
                const filePaths = files.map(file => file.name);
                const { error: deleteError } = await supabase_1.supabase
                    .storage
                    .from(this.BUCKET_NAME)
                    .remove(filePaths);
                if (deleteError)
                    throw deleteError;
            }
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error deleting images', { error, fileId });
            throw error;
        }
    }
    /**
     * Получение публичного URL изображения
     */
    static getPublicUrl(filePath) {
        const { data } = supabase_1.supabase
            .storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(filePath);
        return data.publicUrl;
    }
    /**
     * Обработка и загрузка изображения с заданными параметрами
     */
    static async processAndUpload(file, fileId, options, metadata) {
        const { size, format, quality } = options;
        const dimensions = this.SIZES[size];
        // Пропорциональное изменение размера
        let sharpInstance = (0, sharp_1.default)(file);
        if (size !== ImageSize.ORIGINAL) {
            sharpInstance = sharpInstance.resize({
                width: dimensions.width,
                height: dimensions.height,
                fit: 'inside',
                withoutEnlargement: true
            });
        }
        // Конвертация в нужный формат
        switch (format) {
            case ImageFormat.JPEG:
                sharpInstance = sharpInstance.jpeg({ quality });
                break;
            case ImageFormat.WEBP:
                sharpInstance = sharpInstance.webp({ quality });
                break;
            case ImageFormat.AVIF:
                sharpInstance = sharpInstance.avif({ quality });
                break;
        }
        // Получаем буфер с обработанным изображением
        const processedImageBuffer = await sharpInstance.toBuffer();
        // Загружаем в хранилище
        const filePath = `${fileId}_${size}_${format}.${format}`;
        const { error } = await supabase_1.supabase
            .storage
            .from(this.BUCKET_NAME)
            .upload(filePath, processedImageBuffer, {
            contentType: `image/${format}`
        });
        if (error)
            throw error;
        return this.getPublicUrl(filePath);
    }
    /**
     * Загрузка оригинального изображения без обработки
     */
    static async uploadOriginal(file, fileId, originalExt) {
        const filePath = `${fileId}_original${originalExt}`;
        const { error } = await supabase_1.supabase
            .storage
            .from(this.BUCKET_NAME)
            .upload(filePath, file);
        if (error)
            throw error;
        return this.getPublicUrl(filePath);
    }
}
exports.ImageService = ImageService;
ImageService.BUCKET_NAME = 'property-images';
ImageService.SIZES = {
    [ImageSize.THUMBNAIL]: { width: 200, height: 200 },
    [ImageSize.MEDIUM]: { width: 800, height: 600 },
    [ImageSize.LARGE]: { width: 1600, height: 1200 },
    [ImageSize.ORIGINAL]: { width: 0, height: 0 }, // Оригинальный размер
};
