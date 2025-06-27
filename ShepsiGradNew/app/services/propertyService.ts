import { apiClient } from './api';
import { syncService, SyncEventType } from './syncService';

// Интерфейс для объекта недвижимости
export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  rating: number;
  imageUrl: string;
  description: string;
  latitude?: number;
  longitude?: number;
  area?: number;
  amenities?: string[];
  type?: string;
}

// Интерфейс для параметров поиска
export interface SearchParams {
  query?: string;
  propertyType?: 'apartment' | 'house' | 'villa' | 'room' | 'all';
  priceMin?: number;
  priceMax?: number;
  guests?: number;
  rooms?: number;
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // в метрах
  hasParking?: boolean;
  hasWifi?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  distanceToSea?: number;
  rating?: number;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'distance';
}

// Временные данные для отображения
const PROPERTIES: Property[] = [
  { 
    id: '1', 
    title: 'Апартаменты на берегу моря', 
    price: '5000 ₽/день',
    location: 'Шепси, 200м от моря',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop',
    description: 'Уютные апартаменты с видом на море, всего в 200 метрах от пляжа. Идеально для семейного отдыха.',
    latitude: 44.0356,
    longitude: 39.1542,
    area: 65,
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Кухня'],
    type: 'apartment'
  },
  { 
    id: '2', 
    title: 'Уютная квартира в центре', 
    price: '3500 ₽/день',
    location: 'Центр Шепси',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
    description: 'Современная квартира в центре Шепси с удобным расположением рядом со всей инфраструктурой.',
    latitude: 44.0321,
    longitude: 39.1492,
    area: 45,
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
    type: 'apartment'
  },
  { 
    id: '3', 
    title: 'Коттедж с бассейном', 
    price: '8000 ₽/день',
    location: 'Шепси, район Верхний',
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000&auto=format&fit=crop',
    description: 'Просторный коттедж с собственным бассейном и зоной барбекю. Подходит для большой компании.',
    latitude: 44.0382,
    longitude: 39.1522,
    area: 120,
    amenities: ['Бассейн', 'Wi-Fi', 'Кондиционер', 'Парковка', 'Барбекю'],
    type: 'house'
  },
  { 
    id: '4', 
    title: 'Гостевой дом в Шепси', 
    price: '4000 ₽/день',
    location: 'Шепси, 500м от моря',
    rating: 4.2,
    imageUrl: 'https://images.unsplash.com/photo-1558036117-15d82a90b9b1?q=80&w=1000&auto=format&fit=crop',
    description: 'Гостевой дом с собственной территорией и парковкой. В 500 метрах от пляжа.',
    latitude: 44.0312,
    longitude: 39.1462,
    area: 80,
    amenities: ['Wi-Fi', 'Парковка', 'Кухня'],
    type: 'house'
  },
  { 
    id: '5', 
    title: 'Студия с видом на море', 
    price: '3000 ₽/день',
    location: 'Шепси, 100м от моря',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=1000&auto=format&fit=crop',
    description: 'Компактная студия с видом на море, всего в 100 метрах от пляжа. Идеально для пары.',
    latitude: 44.0342,
    longitude: 39.1512,
    area: 35,
    amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
    type: 'apartment'
  },
  { 
    id: '6', 
    title: 'Вилла с панорамным видом', 
    price: '15000 ₽/день',
    location: 'Шепси, на горе',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop',
    description: 'Роскошная вилла с панорамным видом на море и горы. Собственный бассейн, сауна, большая территория.',
    latitude: 44.0390,
    longitude: 39.1480,
    area: 220,
    amenities: ['Бассейн', 'Wi-Fi', 'Кондиционер', 'Парковка', 'Сауна', 'Барбекю'],
    type: 'villa'
  },
  { 
    id: '7', 
    title: 'Комната в гостевом доме', 
    price: '1500 ₽/день',
    location: 'Шепси, 400м от моря',
    rating: 4.0,
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1000&auto=format&fit=crop',
    description: 'Уютная комната в гостевом доме с общей кухней и ванной. Бюджетный вариант для отдыха.',
    latitude: 44.0335,
    longitude: 39.1510,
    area: 18,
    amenities: ['Wi-Fi'],
    type: 'room'
  },
];

// Локальное хранилище объектов (для имитации работы с сервером)
let propertiesStore = [...PROPERTIES];

// Функция для получения всех объектов
export const getAllProperties = async (): Promise<Property[]> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...propertiesStore]);
    }, 1000);
  });
};

// Функция для получения объекта по ID
export const getPropertyById = async (id: string): Promise<Property | null> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = propertiesStore.find(p => p.id === id);
      resolve(property || null);
    }, 500);
  });
};

// Функция для фильтрации объектов по параметрам поиска
export const getFilteredProperties = async (params: SearchParams): Promise<Property[]> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...propertiesStore];
      
      // Фильтрация по поисковому запросу
      if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.location.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }
      
      // Фильтрация по типу недвижимости
      if (params.propertyType && params.propertyType !== 'all') {
        filtered = filtered.filter(p => p.type === params.propertyType);
      }
      
      // Фильтрация по цене
      if (params.priceMin > 0 || params.priceMax < 20000) {
        filtered = filtered.filter(p => {
          const price = parseInt(p.price.replace(/[^0-9]/g, ''));
          return price >= (params.priceMin || 0) && price <= (params.priceMax || 20000);
        });
      }
      
      // Фильтрация по рейтингу
      if (params.rating && params.rating > 0) {
        filtered = filtered.filter(p => p.rating >= params.rating);
      }
      
      // Фильтрация по удобствам
      if (params.hasWifi) {
        filtered = filtered.filter(p => p.amenities?.includes('Wi-Fi'));
      }
      if (params.hasParking) {
        filtered = filtered.filter(p => p.amenities?.includes('Парковка'));
      }
      if (params.hasPool) {
        filtered = filtered.filter(p => p.amenities?.includes('Бассейн'));
      }
      if (params.hasAirConditioning) {
        filtered = filtered.filter(p => p.amenities?.includes('Кондиционер'));
      }
      
      // Сортировка результатов
      if (params.sort) {
        switch (params.sort) {
          case 'price_asc':
            filtered.sort((a, b) => {
              const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
              const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
              return priceA - priceB;
            });
            break;
          case 'price_desc':
            filtered.sort((a, b) => {
              const priceA = parseInt(a.price.replace(/[^0-9]/g, ''));
              const priceB = parseInt(b.price.replace(/[^0-9]/g, ''));
              return priceB - priceA;
            });
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          // Дополнительные варианты сортировки можно добавить здесь
        }
      }
      
      resolve(filtered);
    }, 800);
  });
};

// Функция для расчета расстояния между двумя точками (в метрах)
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // радиус Земли в метрах
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Функция для добавления нового объекта недвижимости
export const addNewProperty = async (property: Omit<Property, 'id'>): Promise<Property> => {
  // Генерируем уникальный ID
  const newId = (propertiesStore.length + 1).toString();
  
  // Создаем новый объект
  const newProperty: Property = {
    id: newId,
    ...property
  };
  
  // Добавляем объект в локальное хранилище
  propertiesStore.push(newProperty);
  
  // Отправляем уведомление через syncService
  try {
    // Имитируем задержку сервера
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Отправляем событие об обновлении
    const updateEvent = {
      action: 'add',
      property: newProperty
    };
    
    // Уведомляем подписчиков
    syncService.notifySubscribers(SyncEventType.PROPERTY, updateEvent);
    
    console.log('Добавлен новый объект недвижимости:', newProperty.title);
    return newProperty;
  } catch (error) {
    console.error('Ошибка при добавлении объекта:', error);
    throw error;
  }
};

// Функция для обновления объекта недвижимости
export const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property | null> => {
  // Находим объект в хранилище
  const propertyIndex = propertiesStore.findIndex(p => p.id === id);
  
  if (propertyIndex === -1) {
    return null;
  }
  
  // Обновляем объект
  const updatedProperty = {
    ...propertiesStore[propertyIndex],
    ...updates
  };
  
  // Сохраняем обновленный объект в хранилище
  propertiesStore[propertyIndex] = updatedProperty;
  
  // Отправляем уведомление через syncService
  try {
    // Имитируем задержку сервера
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Отправляем событие об обновлении
    const updateEvent = {
      action: 'update',
      property: updatedProperty
    };
    
    // Уведомляем подписчиков
    syncService.notifySubscribers(SyncEventType.PROPERTY, updateEvent);
    
    console.log('Обновлен объект недвижимости:', updatedProperty.title);
    return updatedProperty;
  } catch (error) {
    console.error('Ошибка при обновлении объекта:', error);
    throw error;
  }
};

// Функция для удаления объекта недвижимости
export const deleteProperty = async (id: string): Promise<boolean> => {
  // Проверяем, существует ли объект
  const propertyIndex = propertiesStore.findIndex(p => p.id === id);
  
  if (propertyIndex === -1) {
    return false;
  }
  
  // Удаляем объект из хранилища
  propertiesStore = propertiesStore.filter(p => p.id !== id);
  
  // Отправляем уведомление через syncService
  try {
    // Имитируем задержку сервера
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Отправляем событие об удалении
    const deleteEvent = {
      action: 'delete',
      propertyId: id
    };
    
    // Уведомляем подписчиков
    syncService.notifySubscribers(SyncEventType.PROPERTY, deleteEvent);
    
    console.log('Удален объект недвижимости с ID:', id);
    return true;
  } catch (error) {
    console.error('Ошибка при удалении объекта:', error);
    throw error;
  }
};

// Сервис для работы с объектами недвижимости
const propertyService = {
  getAllProperties,
  getPropertyById,
  getFilteredProperties,
  calculateDistance,
  addNewProperty,
  updateProperty,
  deleteProperty
};

export default propertyService; 