export declare enum ImageSize {
    THUMBNAIL = "thumbnail",
    MEDIUM = "medium",
    LARGE = "large",
    ORIGINAL = "original"
}
export declare enum ImageFormat {
    JPEG = "jpeg",
    WEBP = "webp",
    AVIF = "avif"
}
export declare class ImageService {
    private static readonly BUCKET_NAME;
    private static readonly SIZES;
    /**
     * Оптимизирует и загружает изображение в хранилище
     */
    static uploadAndOptimizeImage(file: Buffer, fileName: string, options?: {
        generateSizes?: ImageSize[];
        generateFormats?: ImageFormat[];
        quality?: number;
    }): Promise<Record<string, string>>;
    /**
     * Удаление изображения и всех его вариаций
     */
    static deleteImage(fileId: string): Promise<void>;
    /**
     * Получение публичного URL изображения
     */
    static getPublicUrl(filePath: string): string;
    /**
     * Обработка и загрузка изображения с заданными параметрами
     */
    private static processAndUpload;
    /**
     * Загрузка оригинального изображения без обработки
     */
    private static uploadOriginal;
}
