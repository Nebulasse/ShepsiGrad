export declare enum StorageBucket {
    PROPERTY_IMAGES = "property-images",
    USER_AVATARS = "user-avatars",
    DOCUMENTS = "documents",
    TEMP = "temp",
    BACKUPS = "backups"
}
export declare enum ContentType {
    JPEG = "image/jpeg",
    PNG = "image/png",
    PDF = "application/pdf",
    ZIP = "application/zip",
    JSON = "application/json",
    TEXT = "text/plain"
}
export interface StorageObject {
    key: string;
    size: number;
    etag: string;
    lastModified: Date;
    url: string;
}
export interface UploadResult {
    key: string;
    url: string;
    etag: string;
}
/**
 * Сервис для работы с S3-совместимым хранилищем
 */
export declare class StorageService {
    private s3;
    constructor();
    /**
     * Получение URL для объекта
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns URL объекта
     */
    getObjectUrl(bucket: StorageBucket, key: string): string;
    /**
     * Загрузка файла в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param filePath Путь к файлу
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    uploadFile(bucket: StorageBucket, key: string, filePath: string, contentType: ContentType): Promise<UploadResult>;
    /**
     * Загрузка буфера в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param buffer Буфер с данными
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    uploadBuffer(bucket: StorageBucket, key: string, buffer: Buffer, contentType: ContentType): Promise<UploadResult>;
    /**
     * Загрузка base64 строки в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param base64Data Base64 строка без префикса (data:image/jpeg;base64,)
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    uploadBase64(bucket: StorageBucket, key: string, base64Data: string, contentType: ContentType): Promise<UploadResult>;
    /**
     * Получение объекта из хранилища
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns Буфер с данными
     */
    getObject(bucket: StorageBucket, key: string): Promise<Buffer>;
    /**
     * Проверка существования объекта
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns true если объект существует
     */
    objectExists(bucket: StorageBucket, key: string): Promise<boolean>;
    /**
     * Удаление объекта из хранилища
     * @param bucket Бакет
     * @param key Ключ объекта
     */
    deleteObject(bucket: StorageBucket, key: string): Promise<void>;
    /**
     * Получение списка объектов в бакете
     * @param bucket Бакет
     * @param prefix Префикс для фильтрации объектов
     * @returns Список объектов
     */
    listObjects(bucket: StorageBucket, prefix?: string): Promise<StorageObject[]>;
    /**
     * Генерация уникального имени файла
     * @param originalName Оригинальное имя файла
     * @returns Уникальное имя файла
     */
    generateUniqueFileName(originalName: string): string;
    /**
     * Получение URL для предварительной загрузки объекта (для загрузки из фронтенда напрямую в S3)
     * @param bucket Бакет
     * @param key Ключ объекта
     * @param contentType Тип содержимого
     * @param expiresIn Время жизни URL в секундах
     * @returns URL для предварительной загрузки
     */
    getPresignedUploadUrl(bucket: StorageBucket, key: string, contentType: ContentType, expiresIn?: number): string;
}
export declare const storageService: StorageService;
