import { apiClient } from './api';

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

// Функция для получения всех объектов
export const getAllProperties = async (): Promise<Property[]> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(PROPERTIES);
    }, 1000);
  });
};

// Функция для получения объекта по ID
export const getPropertyById = async (id: string): Promise<Property | null> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      const property = PROPERTIES.find(p => p.id === id);
      resolve(property || null);
    }, 500);
  });
};

// Функция для фильтрации объектов по параметрам
export const getFilteredProperties = async (params: SearchParams): Promise<Property[]> => {
  // Имитация асинхронного запроса
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...PROPERTIES];
      
      // Фильтрация по поисковому запросу
      if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(query) || 
          p.location.toLowerCase().includes(query) || 
          p.description.toLowerCase().includes(query)
        );
      }
      
      // Фильтрация по типу жилья
      if (params.propertyType && params.propertyType !== 'all') {
        filtered = filtered.filter(p => p.type === params.propertyType);
      }
      
      // Фильтрация по цене
      if (params.priceMin || params.priceMax) {
        filtered = filtered.filter(p => {
          // Извлекаем цену из строки формата "3000 ₽/день"
          const priceMatch = p.price.match(/(\d+)/);
          if (!priceMatch) return true;
          
          const price = parseInt(priceMatch[1]);
          
          if (params.priceMin && price < params.priceMin) return false;
          if (params.priceMax && price > params.priceMax) return false;
          
          return true;
        });
      }
      
      // Фильтрация по количеству комнат
      if (params.rooms && params.rooms > 0) {
        // Для демонстрации используем площадь как примерный индикатор комнат
        filtered = filtered.filter(p => {
          if (!p.area) return false;
          
          // Примерное количество комнат на основе площади
          const estimatedRooms = Math.floor(p.area / 25);
          
          // Для 4+ комнат
          if (params.rooms === 4) {
            return estimatedRooms >= 4;
          }
          
          return estimatedRooms === params.rooms;
        });
      }
      
      // Фильтрация по рейтингу
      if (params.rating && params.rating > 0) {
        filtered = filtered.filter(p => p.rating >= params.rating);
      }
      
      // Фильтрация по расстоянию до моря
      if (params.distanceToSea && params.distanceToSea < 5000) {
        filtered = filtered.filter(p => {
          // Извлекаем расстояние из строки локации, если оно указано
          const distanceMatch = p.location.match(/(\d+)м от моря/);
          if (!distanceMatch) return true; // Если нет информации, включаем объект
          
          const distance = parseInt(distanceMatch[1]);
          return distance <= params.distanceToSea!;
        });
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
              const priceA = parseInt(a.price.match(/(\d+)/)?.[1] || '0');
              const priceB = parseInt(b.price.match(/(\d+)/)?.[1] || '0');
              return priceA - priceB;
            });
            break;
          case 'price_desc':
            filtered.sort((a, b) => {
              const priceA = parseInt(a.price.match(/(\d+)/)?.[1] || '0');
              const priceB = parseInt(b.price.match(/(\d+)/)?.[1] || '0');
              return priceB - priceA;
            });
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'distance':
            filtered.sort((a, b) => {
              const distanceA = a.location.match(/(\d+)м от моря/);
              const distanceB = b.location.match(/(\d+)м от моря/);
              
              const distA = distanceA ? parseInt(distanceA[1]) : 10000;
              const distB = distanceB ? parseInt(distanceB[1]) : 10000;
              
              return distA - distB;
            });
            break;
        }
      }
      
      // Ограничиваем количество результатов для демонстрации
      resolve(filtered);
    }, 1000);
  });
};

// Функция для расчета расстояния между двумя точками по координатам (формула гаверсинусов)
export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Радиус Земли в км
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Расстояние в км
  return distance;
};

// Функция для перевода градусов в радианы
const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Сервис для работы с объектами недвижимости
const propertyService = {
  getAllProperties,
  getPropertyById,
  getFilteredProperties,
  calculateDistance
};

export default propertyService; 