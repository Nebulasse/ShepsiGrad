import { z } from 'zod';

// Схема для создания объекта недвижимости
export const createProperty = z.object({
  body: z.object({
    title: z.string().min(5, { message: 'Название должно содержать минимум 5 символов' }).max(100, { message: 'Название не должно превышать 100 символов' }),
    description: z.string().min(20, { message: 'Описание должно содержать минимум 20 символов' }),
    type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'HOSTEL', 'HOTEL', 'OTHER'], { 
      errorMap: () => ({ message: 'Недопустимый тип объекта недвижимости' })
    }),
    price: z.number().positive({ message: 'Цена должна быть положительным числом' }),
    currency: z.string().default('RUB'),
    priceUnit: z.enum(['night', 'month', 'day'], { 
      errorMap: () => ({ message: 'Недопустимая единица измерения цены' })
    }).default('night'),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().nonnegative().optional(),
    maxGuests: z.number().int().positive({ message: 'Количество гостей должно быть положительным числом' }),
    area: z.number().positive().optional(),
    areaUnit: z.string().default('m²'),
    amenities: z.array(z.string()).optional(),
    address: z.string().min(5, { message: 'Адрес должен содержать минимум 5 символов' }),
    city: z.string().min(2, { message: 'Название города должно содержать минимум 2 символа' }),
    state: z.string().optional(),
    country: z.string().min(2, { message: 'Название страны должно содержать минимум 2 символа' }),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    instantBooking: z.boolean().default(false),
    minNights: z.number().int().positive().default(1),
    maxNights: z.number().int().positive().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cleaningFee: z.number().nonnegative().default(0),
    serviceFee: z.number().nonnegative().default(0),
    houseRules: z.array(z.string()).optional(),
    cancellationPolicy: z.string().optional()
  })
});

// Схема для обновления объекта недвижимости
export const updateProperty = z.object({
  body: z.object({
    title: z.string().min(5, { message: 'Название должно содержать минимум 5 символов' }).max(100, { message: 'Название не должно превышать 100 символов' }).optional(),
    description: z.string().min(20, { message: 'Описание должно содержать минимум 20 символов' }).optional(),
    type: z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'HOSTEL', 'HOTEL', 'OTHER'], { 
      errorMap: () => ({ message: 'Недопустимый тип объекта недвижимости' })
    }).optional(),
    price: z.number().positive({ message: 'Цена должна быть положительным числом' }).optional(),
    currency: z.string().optional(),
    priceUnit: z.enum(['night', 'month', 'day'], { 
      errorMap: () => ({ message: 'Недопустимая единица измерения цены' })
    }).optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().nonnegative().optional(),
    maxGuests: z.number().int().positive({ message: 'Количество гостей должно быть положительным числом' }).optional(),
    area: z.number().positive().optional(),
    areaUnit: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    address: z.string().min(5, { message: 'Адрес должен содержать минимум 5 символов' }).optional(),
    city: z.string().min(2, { message: 'Название города должно содержать минимум 2 символа' }).optional(),
    state: z.string().optional(),
    country: z.string().min(2, { message: 'Название страны должно содержать минимум 2 символа' }).optional(),
    zipCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    instantBooking: z.boolean().optional(),
    minNights: z.number().int().positive().optional(),
    maxNights: z.number().int().positive().optional(),
    checkInTime: z.string().optional(),
    checkOutTime: z.string().optional(),
    cleaningFee: z.number().nonnegative().optional(),
    serviceFee: z.number().nonnegative().optional(),
    houseRules: z.array(z.string()).optional(),
    cancellationPolicy: z.string().optional()
  })
});

// Схема для модерации объекта недвижимости (для администратора)
export const moderateProperty = z.object({
  body: z.object({
    status: z.enum(['ACTIVE', 'PENDING', 'REJECTED', 'SUSPENDED'], { 
      errorMap: () => ({ message: 'Недопустимый статус объекта недвижимости' })
    }).optional(),
    featured: z.boolean().optional(),
    adminComment: z.string().optional()
  })
});

// Схема для установки главного изображения
export const setMainImage = z.object({
  body: z.object({
    imageUrl: z.string().url({ message: 'Неверный формат URL изображения' })
  })
});

// Схема для удаления изображения
export const deleteImage = z.object({
  body: z.object({
    imageUrl: z.string().url({ message: 'Неверный формат URL изображения' })
  })
}); 