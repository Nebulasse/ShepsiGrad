import { supabase } from '../config/supabase';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { LoggerService } from './loggerService';

export enum ImageSize {
    THUMBNAIL = 'thumbnail',
    MEDIUM = 'medium',
    LARGE = 'large',
    ORIGINAL = 'original'
}

export enum ImageFormat {
    JPEG = 'jpeg',
    WEBP = 'webp',
    AVIF = 'avif'
}

interface ImageDimensions {
    width: number;
    height: number;
}

interface ImageProcessOptions {
    size: ImageSize;
    format: ImageFormat;
    quality: number;
}

export class ImageService {
    private static readonly BUCKET_NAME = 'property-images';
    private static readonly SIZES: Record<ImageSize, ImageDimensions> = {
        [ImageSize.THUMBNAIL]: { width: 200, height: 200 },
        [ImageSize.MEDIUM]: { width: 800, height: 600 },
        [ImageSize.LARGE]: { width: 1600, height: 1200 },
        [ImageSize.ORIGINAL]: { width: 0, height: 0 }, // Оригинальный размер
    };

    /**
     * Оптимизирует и загружает изображение в хранилище
     */
    static async uploadAndOptimizeImage(
        file: Buffer,
        fileName: string,
        options: {
            generateSizes?: ImageSize[];
            generateFormats?: ImageFormat[];
            quality?: number;
        } = {}
    ): Promise<Record<string, string>> {
        try {
            const { 
                generateSizes = [ImageSize.THUMBNAIL, ImageSize.MEDIUM, ImageSize.LARGE],
                generateFormats = [ImageFormat.WEBP, ImageFormat.JPEG],
                quality = 80
            } = options;

            // Валидация файла
            const fileExt = path.extname(fileName).toLowerCase();
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
            
            if (!allowedExtensions.includes(fileExt)) {
                throw new Error('Unsupported file format');
            }

            // Уникальный идентификатор для имени файла
            const fileId = uuidv4();
            const imageUrls: Record<string, string> = {};

            // Получаем метаданные изображения
            const metadata = await sharp(file).metadata();

            // Создаем и загружаем разные размеры и форматы
            const uploadPromises: Promise<void>[] = [];

            for (const size of generateSizes) {
                for (const format of generateFormats) {
                    uploadPromises.push(
                        this.processAndUpload(file, fileId, {
                            size,
                            format,
                            quality
                        }, metadata)
                        .then(url => {
                            const key = `${size}_${format}`;
                            imageUrls[key] = url;
                        })
                    );
                }
            }

            // Загружаем оригинал
            uploadPromises.push(
                this.uploadOriginal(file, fileId, fileExt)
                    .then(url => {
                        imageUrls['original'] = url;
                    })
            );

            await Promise.all(uploadPromises);
            return imageUrls;
        } catch (error) {
            LoggerService.error('Error uploading and optimizing image', { error });
            throw error;
        }
    }

    /**
     * Удаление изображения и всех его вариаций
     */
    static async deleteImage(fileId: string): Promise<void> {
        try {
            const { data: files, error } = await supabase
                .storage
                .from(this.BUCKET_NAME)
                .list('', {
                    search: fileId
                });

            if (error) throw error;

            if (files && files.length > 0) {
                const filePaths = files.map(file => file.name);
                const { error: deleteError } = await supabase
                    .storage
                    .from(this.BUCKET_NAME)
                    .remove(filePaths);

                if (deleteError) throw deleteError;
            }
        } catch (error) {
            LoggerService.error('Error deleting images', { error, fileId });
            throw error;
        }
    }

    /**
     * Получение публичного URL изображения
     */
    static getPublicUrl(filePath: string): string {
        const { data } = supabase
            .storage
            .from(this.BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    /**
     * Обработка и загрузка изображения с заданными параметрами
     */
    private static async processAndUpload(
        file: Buffer,
        fileId: string,
        options: ImageProcessOptions,
        metadata: sharp.Metadata
    ): Promise<string> {
        const { size, format, quality } = options;
        const dimensions = this.SIZES[size];

        // Пропорциональное изменение размера
        let sharpInstance = sharp(file);
        
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
        const { error } = await supabase
            .storage
            .from(this.BUCKET_NAME)
            .upload(filePath, processedImageBuffer, {
                contentType: `image/${format}`
            });

        if (error) throw error;

        return this.getPublicUrl(filePath);
    }

    /**
     * Загрузка оригинального изображения без обработки
     */
    private static async uploadOriginal(
        file: Buffer,
        fileId: string,
        originalExt: string
    ): Promise<string> {
        const filePath = `${fileId}_original${originalExt}`;
        
        const { error } = await supabase
            .storage
            .from(this.BUCKET_NAME)
            .upload(filePath, file);

        if (error) throw error;

        return this.getPublicUrl(filePath);
    }
} 