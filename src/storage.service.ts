import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { getModuleLogger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

const logger = getModuleLogger('StorageService');

export interface StorageObject {
  key: string;
  size: number;
  etag: string;
  lastModified: Date;
  url: string;
}

class StorageService {
  private s3: S3Client;
  private defaultBucket: string;

  constructor() {
    // Создаем клиент S3
    this.s3 = new S3Client({
      region: env.s3.region,
      credentials: {
        accessKeyId: env.s3.accessKeyId,
        secretAccessKey: env.s3.secretAccessKey
      },
      endpoint: env.s3.endpoint,
      forcePathStyle: !!env.s3.endpoint // для MinIO и других S3-совместимых хранилищ
    });

    this.defaultBucket = env.s3.bucket;
  }

  /**
   * Получение URL объекта в S3
   */
  public getObjectUrl(bucket: string, key: string): string {
    // Если указан кастомный endpoint (например, для MinIO), используем его
    if (env.s3.endpoint) {
      // Формируем URL на основе endpoint
      return `${env.s3.endpoint}/${bucket}/${key}`;
    }
    
    // Для AWS S3 формируем стандартный URL
    return `https://${bucket}.s3.${env.s3.region}.amazonaws.com/${key}`;
  }

  /**
   * Получение подписанного URL для временного доступа к объекту
   */
  public async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      logger.error(`Ошибка при получении подписанного URL: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Загрузка файла в S3
   */
  public async uploadFile(
    filePath: string,
    key?: string,
    bucket: string = this.defaultBucket,
    contentType?: string
  ): Promise<{ key: string; url: string }> {
    try {
      // Если ключ не указан, генерируем его на основе имени файла
      if (!key) {
        const fileName = path.basename(filePath);
        key = `${uuidv4()}-${fileName}`;
      }

      // Читаем файл
      const fileContent = fs.readFileSync(filePath);

      // Определяем тип контента, если не указан
      if (!contentType) {
        contentType = this.getContentType(filePath);
      }

      // Загружаем файл в S3
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: fileContent,
        ContentType: contentType
      });

      await this.s3.send(command);

      // Возвращаем ключ и URL загруженного файла
      return {
        key,
        url: this.getObjectUrl(bucket, key)
      };
    } catch (error) {
      logger.error(`Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Загрузка буфера в S3
   */
  public async uploadBuffer(
    buffer: Buffer,
    key: string,
    bucket: string = this.defaultBucket,
    contentType = 'application/octet-stream'
  ): Promise<{ key: string; url: string }> {
    try {
      // Загружаем буфер в S3
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType
      });

      await this.s3.send(command);

      // Возвращаем ключ и URL загруженного файла
      return {
        key,
        url: this.getObjectUrl(bucket, key)
      };
    } catch (error) {
      logger.error(`Ошибка при загрузке буфера: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Загрузка base64 строки в S3
   */
  public async uploadBase64(
    base64Data: string,
    key: string,
    bucket: string = this.defaultBucket,
    contentType = 'image/jpeg'
  ): Promise<{ key: string; url: string }> {
    try {
      // Удаляем заголовок base64 (например, "data:image/jpeg;base64,")
      const base64Body = base64Data.replace(/^data:([A-Za-z-+/]+);base64,/, '');
      
      // Преобразуем base64 в буфер
      const buffer = Buffer.from(base64Body, 'base64');

      // Загружаем буфер
      return this.uploadBuffer(buffer, key, bucket, contentType);
    } catch (error) {
      logger.error(`Ошибка при загрузке base64: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Получение объекта из S3
   */
  public async getObject(key: string, bucket: string = this.defaultBucket): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });

      const response = await this.s3.send(command);
      
      // Преобразуем поток в буфер
      const chunks: Buffer[] = [];
      const stream = response.Body as Readable;
      
      for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error(`Ошибка при получении объекта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Проверка существования объекта в S3
   */
  public async objectExists(key: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await this.s3.send(command);
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === 'NotFound') {
        return false;
      }
      logger.error(`Ошибка при проверке объекта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Удаление объекта из S3
   */
  public async deleteObject(key: string, bucket: string = this.defaultBucket): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: bucket,
        Key: key
      });

      await this.s3.send(command);
      return true;
    } catch (error) {
      logger.error(`Ошибка при удалении объекта: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Получение списка объектов из директории в S3
   */
  public async listObjects(prefix: string, bucket: string = this.defaultBucket): Promise<StorageObject[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix
      });

      const result = await this.s3.send(command);
      
      return (result.Contents || []).map((item) => ({
        key: item.Key || '',
        size: item.Size || 0,
        etag: item.ETag?.replace(/"/g, '') || '',
        lastModified: item.LastModified || new Date(),
        url: this.getObjectUrl(bucket, item.Key || '')
      }));
    } catch (error) {
      logger.error(`Ошибка при получении списка объектов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      throw error;
    }
  }

  /**
   * Определение типа контента по расширению файла
   */
  private getContentType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.zip': 'application/zip'
    };

    return contentTypes[extension] || 'application/octet-stream';
  }
}

export default new StorageService(); 