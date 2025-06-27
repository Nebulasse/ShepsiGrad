"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.StorageService = exports.ContentType = exports.StorageBucket = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = require("fs");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const crypto_1 = require("crypto");
// Создаем логгер для модуля
const logger = (0, logger_1.getModuleLogger)('StorageService');
// Типы хранилищ
var StorageBucket;
(function (StorageBucket) {
    StorageBucket["PROPERTY_IMAGES"] = "property-images";
    StorageBucket["USER_AVATARS"] = "user-avatars";
    StorageBucket["DOCUMENTS"] = "documents";
    StorageBucket["TEMP"] = "temp";
    StorageBucket["BACKUPS"] = "backups";
})(StorageBucket || (exports.StorageBucket = StorageBucket = {}));
// Типы содержимого файлов
var ContentType;
(function (ContentType) {
    ContentType["JPEG"] = "image/jpeg";
    ContentType["PNG"] = "image/png";
    ContentType["PDF"] = "application/pdf";
    ContentType["ZIP"] = "application/zip";
    ContentType["JSON"] = "application/json";
    ContentType["TEXT"] = "text/plain";
})(ContentType || (exports.ContentType = ContentType = {}));
/**
 * Сервис для работы с S3-совместимым хранилищем
 */
class StorageService {
    constructor() {
        this.s3 = new aws_sdk_1.S3({
            region: env_1.env.s3.region,
            accessKeyId: env_1.env.s3.accessKeyId,
            secretAccessKey: env_1.env.s3.secretAccessKey,
            endpoint: env_1.env.s3.endpoint,
            s3ForcePathStyle: !!env_1.env.s3.endpoint, // для MinIO и других S3-совместимых хранилищ
            signatureVersion: 'v4',
        });
    }
    /**
     * Получение URL для объекта
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns URL объекта
     */
    getObjectUrl(bucket, key) {
        if (env_1.env.s3.endpoint) {
            // Для MinIO используем конструированный URL
            return `${env_1.env.s3.endpoint}/${bucket}/${key}`;
        }
        else {
            // Для AWS S3 используем getSignedUrl
            return this.s3.getSignedUrl('getObject', {
                Bucket: bucket,
                Key: key,
                Expires: 60 * 60 * 24 * 7, // 7 дней
            });
        }
    }
    /**
     * Загрузка файла в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param filePath Путь к файлу
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    async uploadFile(bucket, key, filePath, contentType) {
        try {
            const fileStream = (0, fs_1.createReadStream)(filePath);
            const params = {
                Bucket: bucket,
                Key: key,
                Body: fileStream,
                ContentType: contentType,
            };
            const result = await this.s3.upload(params).promise();
            logger.info(`Файл загружен: ${result.Key}`);
            return {
                key: result.Key,
                url: this.getObjectUrl(bucket, result.Key),
                etag: result.ETag,
            };
        }
        catch (error) {
            logger.error(`Ошибка при загрузке файла: ${error.message}`);
            throw error;
        }
    }
    /**
     * Загрузка буфера в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param buffer Буфер с данными
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    async uploadBuffer(bucket, key, buffer, contentType) {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: contentType,
            };
            const result = await this.s3.upload(params).promise();
            logger.info(`Буфер загружен: ${result.Key}`);
            return {
                key: result.Key,
                url: this.getObjectUrl(bucket, result.Key),
                etag: result.ETag,
            };
        }
        catch (error) {
            logger.error(`Ошибка при загрузке буфера: ${error.message}`);
            throw error;
        }
    }
    /**
     * Загрузка base64 строки в хранилище
     * @param bucket Бакет
     * @param key Ключ объекта (имя файла)
     * @param base64Data Base64 строка без префикса (data:image/jpeg;base64,)
     * @param contentType Тип содержимого
     * @returns Результат загрузки
     */
    async uploadBase64(bucket, key, base64Data, contentType) {
        try {
            const buffer = Buffer.from(base64Data, 'base64');
            return this.uploadBuffer(bucket, key, buffer, contentType);
        }
        catch (error) {
            logger.error(`Ошибка при загрузке base64: ${error.message}`);
            throw error;
        }
    }
    /**
     * Получение объекта из хранилища
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns Буфер с данными
     */
    async getObject(bucket, key) {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
            };
            const result = await this.s3.getObject(params).promise();
            return result.Body;
        }
        catch (error) {
            logger.error(`Ошибка при получении объекта: ${error.message}`);
            throw error;
        }
    }
    /**
     * Проверка существования объекта
     * @param bucket Бакет
     * @param key Ключ объекта
     * @returns true если объект существует
     */
    async objectExists(bucket, key) {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
            };
            await this.s3.headObject(params).promise();
            return true;
        }
        catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            logger.error(`Ошибка при проверке объекта: ${error.message}`);
            throw error;
        }
    }
    /**
     * Удаление объекта из хранилища
     * @param bucket Бакет
     * @param key Ключ объекта
     */
    async deleteObject(bucket, key) {
        try {
            const params = {
                Bucket: bucket,
                Key: key,
            };
            await this.s3.deleteObject(params).promise();
            logger.info(`Объект удален: ${key}`);
        }
        catch (error) {
            logger.error(`Ошибка при удалении объекта: ${error.message}`);
            throw error;
        }
    }
    /**
     * Получение списка объектов в бакете
     * @param bucket Бакет
     * @param prefix Префикс для фильтрации объектов
     * @returns Список объектов
     */
    async listObjects(bucket, prefix) {
        try {
            const params = {
                Bucket: bucket,
                Prefix: prefix,
            };
            const result = await this.s3.listObjectsV2(params).promise();
            return (result.Contents || []).map((item) => ({
                key: item.Key,
                size: item.Size,
                etag: item.ETag,
                lastModified: item.LastModified,
                url: this.getObjectUrl(bucket, item.Key),
            }));
        }
        catch (error) {
            logger.error(`Ошибка при получении списка объектов: ${error.message}`);
            throw error;
        }
    }
    /**
     * Генерация уникального имени файла
     * @param originalName Оригинальное имя файла
     * @returns Уникальное имя файла
     */
    generateUniqueFileName(originalName) {
        const extension = originalName.split('.').pop();
        return `${(0, crypto_1.randomUUID)()}.${extension}`;
    }
    /**
     * Получение URL для предварительной загрузки объекта (для загрузки из фронтенда напрямую в S3)
     * @param bucket Бакет
     * @param key Ключ объекта
     * @param contentType Тип содержимого
     * @param expiresIn Время жизни URL в секундах
     * @returns URL для предварительной загрузки
     */
    getPresignedUploadUrl(bucket, key, contentType, expiresIn = 300) {
        const params = {
            Bucket: bucket,
            Key: key,
            ContentType: contentType,
            Expires: expiresIn,
        };
        return this.s3.getSignedUrl('putObject', params);
    }
}
exports.StorageService = StorageService;
// Экспортируем экземпляр сервиса для использования в приложении
exports.storageService = new StorageService();
