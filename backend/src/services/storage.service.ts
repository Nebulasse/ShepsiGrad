import { S3 } from 'aws-sdk';
import { createReadStream } from 'fs';
import { getModuleLogger } from '../utils/logger';
import { env } from '../config/env';
import { randomUUID } from 'crypto';

// Создаем логгер для модуля
const logger = getModuleLogger('StorageService');

// Типы хранилищ
export enum StorageBucket {
  PROPERTY_IMAGES = 'property-images',
  USER_AVATARS = 'user-avatars',
  DOCUMENTS = 'documents',
  TEMP = 'temp',
  BACKUPS = 'backups',
}

// Типы содержимого файлов
export enum ContentType {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  PDF = 'application/pdf',
  ZIP = 'application/zip',
  JSON = 'application/json',
  TEXT = 'text/plain',
}

// Интерфейс для объекта в хранилище
export interface StorageObject {
  key: string;
  size: number;
  etag: string;
  lastModified: Date;
  url: string;
}

// Интерфейс для результата загрузки
export interface UploadResult {
  key: string;
  url: string;
  etag: string;
}

/**
 * Сервис для работы с S3-совместимым хранилищем
 */
export class StorageService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: env.s3.region,
      accessKeyId: env.s3.accessKeyId,
      secretAccessKey: env.s3.secretAccessKey,
      endpoint: env.s3.endpoint,
      s3ForcePathStyle: !!env.s3.endpoint, // для MinIO и других S3-совместимых хранилищ
      signatureVersion: 'v4',
    });
  }

  /**
   * Получение URL для объекта
   * @param bucket Бакет
   * @param key Ключ объекта
   * @returns URL объекта
   */
  getObjectUrl(bucket: StorageBucket, key: string): string {
    if (env.s3.endpoint) {
      // Для MinIO используем конструированный URL
      return `${env.s3.endpoint}/${bucket}/${key}`;
    } else {
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
  async uploadFile(
    bucket: StorageBucket,
    key: string,
    filePath: string,
    contentType: ContentType,
  ): Promise<UploadResult> {
    try {
      const fileStream = createReadStream(filePath);

      const params: S3.PutObjectRequest = {
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
    } catch (error) {
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
  async uploadBuffer(
    bucket: StorageBucket,
    key: string,
    buffer: Buffer,
    contentType: ContentType,
  ): Promise<UploadResult> {
    try {
      const params: S3.PutObjectRequest = {
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
    } catch (error) {
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
  async uploadBase64(
    bucket: StorageBucket,
    key: string,
    base64Data: string,
    contentType: ContentType,
  ): Promise<UploadResult> {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
      return this.uploadBuffer(bucket, key, buffer, contentType);
    } catch (error) {
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
  async getObject(bucket: StorageBucket, key: string): Promise<Buffer> {
    try {
      const params: S3.GetObjectRequest = {
        Bucket: bucket,
        Key: key,
      };

      const result = await this.s3.getObject(params).promise();

      return result.Body as Buffer;
    } catch (error) {
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
  async objectExists(bucket: StorageBucket, key: string): Promise<boolean> {
    try {
      const params: S3.HeadObjectRequest = {
        Bucket: bucket,
        Key: key,
      };

      await this.s3.headObject(params).promise();
      return true;
    } catch (error) {
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
  async deleteObject(bucket: StorageBucket, key: string): Promise<void> {
    try {
      const params: S3.DeleteObjectRequest = {
        Bucket: bucket,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
      logger.info(`Объект удален: ${key}`);
    } catch (error) {
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
  async listObjects(
    bucket: StorageBucket,
    prefix?: string,
  ): Promise<StorageObject[]> {
    try {
      const params: S3.ListObjectsV2Request = {
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
    } catch (error) {
      logger.error(`Ошибка при получении списка объектов: ${error.message}`);
      throw error;
    }
  }

  /**
   * Генерация уникального имени файла
   * @param originalName Оригинальное имя файла
   * @returns Уникальное имя файла
   */
  generateUniqueFileName(originalName: string): string {
    const extension = originalName.split('.').pop();
    return `${randomUUID()}.${extension}`;
  }

  /**
   * Получение URL для предварительной загрузки объекта (для загрузки из фронтенда напрямую в S3)
   * @param bucket Бакет
   * @param key Ключ объекта
   * @param contentType Тип содержимого
   * @param expiresIn Время жизни URL в секундах
   * @returns URL для предварительной загрузки
   */
  getPresignedUploadUrl(
    bucket: StorageBucket,
    key: string,
    contentType: ContentType,
    expiresIn = 300,
  ): string {
    const params = {
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      Expires: expiresIn,
    };

    return this.s3.getSignedUrl('putObject', params);
  }
}

// Экспортируем экземпляр сервиса для использования в приложении
export const storageService = new StorageService(); 