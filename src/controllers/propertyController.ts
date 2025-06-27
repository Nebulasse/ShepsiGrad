import { Request, Response } from 'express';
import { AppDataSource } from '../database/connection';
import { Property, PropertyStatus, PropertyType } from '../models/Property';
import { User } from '../models/User';
import { Favorite } from '../models/Favorite';
import { getModuleLogger } from '../utils/logger';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest, wrapAuthHandler } from '../middleware/auth.middleware';
import { StorageService } from '../services/storage.service';

const logger = getModuleLogger('PropertyController');
const storageService = new StorageService();

class PropertyController {
  /**
   * Получение всех объектов недвижимости с фильтрацией и пагинацией
   */
  getAllProperties = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        type,
        minPrice,
        maxPrice,
        minBedrooms,
        maxBedrooms,
        minBathrooms,
        maxBathrooms,
        city,
        country,
        featured,
        instantBooking,
        status,
        search
      } = req.query;

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Строим запрос с фильтрами
      const propertyRepository = AppDataSource.getRepository(Property);
      const queryBuilder = propertyRepository.createQueryBuilder('property')
        .leftJoinAndSelect('property.owner', 'owner')
        .where('property.status = :status', { status: status || PropertyStatus.ACTIVE });

      // Применяем фильтры
      if (type) {
        queryBuilder.andWhere('property.type = :type', { type });
      }

      if (minPrice) {
        queryBuilder.andWhere('property.price >= :minPrice', { minPrice });
      }

      if (maxPrice) {
        queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice });
      }

      if (minBedrooms) {
        queryBuilder.andWhere('property.bedrooms >= :minBedrooms', { minBedrooms });
      }

      if (maxBedrooms) {
        queryBuilder.andWhere('property.bedrooms <= :maxBedrooms', { maxBedrooms });
      }

      if (minBathrooms) {
        queryBuilder.andWhere('property.bathrooms >= :minBathrooms', { minBathrooms });
      }

      if (maxBathrooms) {
        queryBuilder.andWhere('property.bathrooms <= :maxBathrooms', { maxBathrooms });
      }

      if (city) {
        queryBuilder.andWhere('LOWER(property.city) LIKE LOWER(:city)', { city: `%${city}%` });
      }

      if (country) {
        queryBuilder.andWhere('LOWER(property.country) LIKE LOWER(:country)', { country: `%${country}%` });
      }

      if (featured) {
        queryBuilder.andWhere('property.featured = :featured', { featured: featured === 'true' });
      }

      if (instantBooking) {
        queryBuilder.andWhere('property.instantBooking = :instantBooking', { instantBooking: instantBooking === 'true' });
      }

      if (search) {
        queryBuilder.andWhere(
          '(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.description) LIKE LOWER(:search) OR LOWER(property.city) LIKE LOWER(:search) OR LOWER(property.country) LIKE LOWER(:search))',
          { search: `%${search}%` }
        );
      }

      // Получаем общее количество объектов
      const total = await queryBuilder.getCount();

      // Применяем пагинацию и сортировку
      queryBuilder
        .orderBy('property.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      const properties = await queryBuilder.getMany();

      return res.status(200).json({
        success: true,
        data: {
          properties,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Ошибка при получении объектов недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении объектов недвижимости'
      });
    }
  };

  /**
   * Получение объекта недвижимости по ID
   */
  getPropertyById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      
      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id },
        relations: ['owner', 'reviews']
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, добавлен ли объект в избранное, если пользователь аутентифицирован
      const authReq = req as AuthenticatedRequest;
      if (authReq.user) {
        const favoriteRepository = AppDataSource.getRepository(Favorite);
        const isFavorite = await favoriteRepository.findOne({
          where: {
            userId: authReq.user.id,
            propertyId: id
          }
        });

        property.isFavorite = !!isFavorite;
      }

      return res.status(200).json({
        success: true,
        data: property
      });
    } catch (error) {
      logger.error(`Ошибка при получении объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении объекта недвижимости'
      });
    }
  };

  /**
   * Создание нового объекта недвижимости
   */
  createProperty = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const {
        title,
        description,
        type,
        price,
        currency,
        priceUnit,
        bedrooms,
        bathrooms,
        maxGuests,
        area,
        areaUnit,
        amenities,
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        instantBooking,
        minNights,
        maxNights,
        checkInTime,
        checkOutTime,
        cleaningFee,
        serviceFee,
        houseRules,
        cancellationPolicy
      } = req.body;

      // Проверяем, что пользователь может создавать объекты недвижимости
      if (req.user.role !== 'landlord' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на создание объектов недвижимости'
        });
      }

      const propertyRepository = AppDataSource.getRepository(Property);
      
      // Создаем новый объект недвижимости
      const newProperty = propertyRepository.create({
        title,
        description,
        type: type as PropertyType,
        price,
        currency: currency || 'RUB',
        priceUnit: priceUnit || 'night',
        bedrooms,
        bathrooms,
        maxGuests,
        area,
        areaUnit,
        amenities,
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        status: PropertyStatus.PENDING,
        featured: false,
        instantBooking: instantBooking || false,
        minNights: minNights || 1,
        maxNights,
        checkInTime,
        checkOutTime,
        cleaningFee: cleaningFee || 0,
        serviceFee: serviceFee || 0,
        houseRules,
        cancellationPolicy,
        ownerId: req.user.id
      });

      await propertyRepository.save(newProperty);

      return res.status(201).json({
        success: true,
        message: 'Объект недвижимости успешно создан',
        data: newProperty
      });
    } catch (error) {
      logger.error(`Ошибка при создании объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при создании объекта недвижимости'
      });
    }
  });

  /**
   * Обновление объекта недвижимости
   */
  updateProperty = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта или администратором
      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на редактирование этого объекта недвижимости'
        });
      }

      // Обновляем объект
      propertyRepository.merge(property, updateData);
      
      // Если статус изменен на ACTIVE и пользователь не админ, возвращаем статус PENDING
      if (updateData.status === PropertyStatus.ACTIVE && req.user.role !== 'admin') {
        property.status = PropertyStatus.PENDING;
      }

      await propertyRepository.save(property);

      return res.status(200).json({
        success: true,
        message: 'Объект недвижимости успешно обновлен',
        data: property
      });
    } catch (error) {
      logger.error(`Ошибка при обновлении объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении объекта недвижимости'
      });
    }
  });

  /**
   * Удаление объекта недвижимости
   */
  deleteProperty = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта или администратором
      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на удаление этого объекта недвижимости'
        });
      }

      await propertyRepository.remove(property);

      return res.status(200).json({
        success: true,
        message: 'Объект недвижимости успешно удален'
      });
    } catch (error) {
      logger.error(`Ошибка при удалении объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при удалении объекта недвижимости'
      });
    }
  });

  /**
   * Загрузка изображений для объекта недвижимости
   */
  uploadImages = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Не выбраны файлы для загрузки'
        });
      }

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта или администратором
      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на загрузку изображений для этого объекта недвижимости'
        });
      }

      // Загружаем изображения
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const result = await storageService.uploadFile(`properties/${id}/${Date.now()}-${file.originalname}`, file.buffer, file.mimetype);
        if (result) {
          uploadedUrls.push(result.url);
        }
      }

      // Обновляем массив изображений объекта
      property.images = property.images ? [...property.images, ...uploadedUrls] : uploadedUrls;
      
      // Если главное изображение не установлено, устанавливаем первое загруженное
      if (!property.mainImage && uploadedUrls.length > 0) {
        property.mainImage = uploadedUrls[0];
      }

      await propertyRepository.save(property);

      return res.status(200).json({
        success: true,
        message: 'Изображения успешно загружены',
        data: {
          images: uploadedUrls,
          property
        }
      });
    } catch (error) {
      logger.error(`Ошибка при загрузке изображений: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при загрузке изображений'
      });
    }
  });

  /**
   * Установка главного изображения для объекта недвижимости
   */
  setMainImage = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL изображения обязателен'
        });
      }

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта или администратором
      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на редактирование этого объекта недвижимости'
        });
      }

      // Проверяем, что изображение есть в массиве изображений объекта
      if (property.images && !property.images.includes(imageUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Указанное изображение не принадлежит этому объекту недвижимости'
        });
      }

      property.mainImage = imageUrl;
      await propertyRepository.save(property);

      return res.status(200).json({
        success: true,
        message: 'Главное изображение успешно установлено',
        data: property
      });
    } catch (error) {
      logger.error(`Ошибка при установке главного изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при установке главного изображения'
      });
    }
  });

  /**
   * Удаление изображения из объекта недвижимости
   */
  deleteImage = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'URL изображения обязателен'
        });
      }

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Проверяем, что пользователь является владельцем объекта или администратором
      if (property.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на редактирование этого объекта недвижимости'
        });
      }

      // Проверяем, что изображение есть в массиве изображений объекта
      if (!property.images || !property.images.includes(imageUrl)) {
        return res.status(400).json({
          success: false,
          message: 'Указанное изображение не принадлежит этому объекту недвижимости'
        });
      }

      // Удаляем изображение из массива
      property.images = property.images.filter(img => img !== imageUrl);

      // Если удаляемое изображение было главным, устанавливаем новое главное изображение
      if (property.mainImage === imageUrl) {
        property.mainImage = property.images.length > 0 ? property.images[0] : null;
      }

      await propertyRepository.save(property);

      // Удаляем файл из хранилища
      try {
        const key = imageUrl.split('/').slice(-2).join('/');
        await storageService.deleteObject('properties', key);
      } catch (error) {
        logger.warn(`Не удалось удалить файл из хранилища: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Изображение успешно удалено',
        data: property
      });
    } catch (error) {
      logger.error(`Ошибка при удалении изображения: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при удалении изображения'
      });
    }
  });

  /**
   * Получение объектов недвижимости пользователя
   */
  getUserProperties = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.params.userId || req.user.id;
      
      // Если запрашиваются объекты другого пользователя, проверяем права
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на просмотр объектов недвижимости этого пользователя'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const propertyRepository = AppDataSource.getRepository(Property);
      
      // Получаем общее количество объектов
      const total = await propertyRepository.count({
        where: { ownerId: userId }
      });

      // Получаем объекты с пагинацией
      const properties = await propertyRepository.find({
        where: { ownerId: userId },
        skip,
        take: limit,
        order: { createdAt: 'DESC' }
      });

      return res.status(200).json({
        success: true,
        data: {
          properties,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      logger.error(`Ошибка при получении объектов недвижимости пользователя: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при получении объектов недвижимости пользователя'
      });
    }
  });

  /**
   * Модерация объекта недвижимости (для администратора)
   */
  moderateProperty = wrapAuthHandler(async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { status, featured, adminComment } = req.body;

      // Проверяем, что пользователь является администратором
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'У вас нет прав на модерацию объектов недвижимости'
        });
      }

      const propertyRepository = AppDataSource.getRepository(Property);
      const property = await propertyRepository.findOne({
        where: { id }
      });

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Объект недвижимости не найден'
        });
      }

      // Обновляем статус модерации
      if (status !== undefined) property.status = status as PropertyStatus;
      if (featured !== undefined) property.featured = featured;
      property.updatedAt = new Date();

      await propertyRepository.save(property);

      return res.status(200).json({
        success: true,
        message: 'Объект недвижимости успешно модерирован',
        data: property
      });
    } catch (error) {
      logger.error(`Ошибка при модерации объекта недвижимости: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при модерации объекта недвижимости'
      });
    }
  });

  /**
   * Поиск объектов недвижимости по местоположению
   */
  searchByLocation = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { latitude, longitude, radius } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Необходимо указать координаты (latitude, longitude)'
        });
      }

      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const rad = parseFloat(radius as string) || 10; // Радиус поиска в км, по умолчанию 10 км

      const propertyRepository = AppDataSource.getRepository(Property);
      
      // Используем SQL-запрос для поиска по расстоянию
      // Формула расчета расстояния по координатам (формула гаверсинуса)
      const properties = await propertyRepository
        .createQueryBuilder('property')
        .select()
        .addSelect(`(
          6371 * acos(
            cos(radians(:latitude)) * 
            cos(radians(property.latitude)) * 
            cos(radians(property.longitude) - radians(:longitude)) + 
            sin(radians(:latitude)) * 
            sin(radians(property.latitude))
          )
        )`, 'distance')
        .where('property.status = :status', { status: PropertyStatus.ACTIVE })
        .andWhere('property.latitude IS NOT NULL')
        .andWhere('property.longitude IS NOT NULL')
        .setParameters({
          latitude: lat,
          longitude: lng
        })
        .having('distance <= :radius', { radius: rad })
        .orderBy('distance', 'ASC')
        .getMany();

      return res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      logger.error(`Ошибка при поиске объектов недвижимости по местоположению: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return res.status(500).json({
        success: false,
        message: 'Ошибка при поиске объектов недвижимости по местоположению'
      });
    }
  };
}

export default new PropertyController(); 