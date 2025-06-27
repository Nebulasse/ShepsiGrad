import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { getModuleLogger } from '../utils/logger';
import { config } from '../config/env';

const logger = getModuleLogger('StorageService');

/**
 * Интерфейс для объекта хранилища
 */
interface StorageObject {
  key: string;
  size: number;
  etag: string;
  lastModified: Date;
  url: string;
}

/**
 * Интерфейс для результата загрузки
 */
interface UploadResult {
  key: string;
  url: string;
  etag?: string;
}

export class StorageService {
  private s3Client: S3Client;
  private defaultBucket: string;

  constructor() {
    // Инициализируем S3 клиент
    this.s3Client = new S3Client({
      region: config.s3.region,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey
      },
      endpoint: config.s3.endpoint,
      forcePathStyle: !!config.s3.endpoint // для MinIO и других S3-совместимых хранилищ
    });

    this.defaultBucket = config.s3.bucket;
  }

  /**
   * Получение URL объекта
   */
  private getObjectUrl(bucket: string, key: string): string {
    if (config.s3.endpoint) {
      // Для локальных S3-совместимых хранилищ
      return `${config.s3.endpoint}/${bucket}/${key}`;
    } else {
      // Для AWS S3
      return `https://${bucket}.s3.${config.s3.region}.amazonaws.com/${key}`;
    }
  }

  /**
   * Загрузка файла из локальной файловой системы
   */
  async uploadFile(key: string, filePath: string | Buffer, contentType?: string): Promise<UploadResult | null> {
    try {
      let fileContent: Buffer;
      
      if (typeof filePath === 'string') {
        // Если передан путь к файлу
        fileContent = fs.readFileSync(filePath);
        if (!contentType) {
          contentType = this.getContentType(filePath);
        }
      } else {
        // Если передан буфер
        fileContent = filePath;
        contentType = contentType || 'application/octet-stream';
      }

      const command = new PutObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        url: this.getObjectUrl(this.defaultBucket, key),
        etag: response.ETag
      };
    } catch (error: unknown) {
      logger.error(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Загрузка буфера данных
   */
  async uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<UploadResult | null> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      });

      const response = await this.s3Client.send(command);

      return {
        key,
        url: this.getObjectUrl(this.defaultBucket, key),
        etag: response.ETag
      };
    } catch (error: unknown) {
      logger.error(`Ошибка при загрузке буфера: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Загрузка данных из base64 строки
   */
  async uploadBase64(key: string, base64Data: string, contentType: string): Promise<UploadResult | null> {
    try {
      // Удаляем префикс data:image/jpeg;base64, если он есть
      const base64Content = base64Data.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      const buffer = Buffer.from(base64Content, 'base64');

      return this.uploadBuffer(key, buffer, contentType);
    } catch (error: unknown) {
      logger.error(`Ошибка при загрузке base64: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Получение объекта
   */
  async getObject(bucket: string, key: string): Promise<Buffer | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      // Преобразуем поток в буфер
      const chunks: Buffer[] = [];
      if (response.Body) {
        for await (const chunk of response.Body as any) {
          chunks.push(Buffer.from(chunk));
        }
      }
      
      return Buffer.concat(chunks);
    } catch (error: unknown) {
      logger.error(`Ошибка при получении объекта: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Проверка существования объекта
   */
  async objectExists(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: unknown) {
      const awsError = error as { code?: string };
      if (awsError && awsError.code === 'NotFound') {
        return false;
      }
      logger.error(`Ошибка при проверке объекта: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Удаление объекта
   */
  async deleteObject(bucket: string, key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await this.s3Client.send(command);
      return true;
    } catch (error: unknown) {
      logger.error(`Ошибка при удалении объекта: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * Получение списка объектов в директории
   */
  async listObjects(bucket: string, prefix: string): Promise<StorageObject[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix
      });

      const result = await this.s3Client.send(command);
      
      return (result.Contents || []).map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        etag: item.ETag || '',
        lastModified: item.LastModified || new Date(),
        url: this.getObjectUrl(bucket, item.Key || '')
      })) as StorageObject[];
    } catch (error: unknown) {
      logger.error(`Ошибка при получении списка объектов: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  /**
   * Получение URL для загрузки файла напрямую в S3
   */
  async getPresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.defaultBucket,
        Key: key,
        ContentType: contentType
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error: unknown) {
      logger.error(`Ошибка при получении URL для загрузки: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Получение URL для скачивания объекта
   */
  async getPresignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.defaultBucket,
        Key: key
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error: unknown) {
      logger.error(`Ошибка при получении URL для скачивания: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  /**
   * Определение типа контента по расширению файла
   */
  private getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mime.lookup(extension);
    
    if (!contentType) {
      // Если тип не определен, используем бинарный тип
      return 'application/octet-stream';
    }
    
    return contentType;
  }

  /**
   * Генерация уникального имени файла
   */
  generateUniqueFileName(originalName: string): string {
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    
    return `${baseName}-${timestamp}-${uuid}${extension}`;
  }
} 