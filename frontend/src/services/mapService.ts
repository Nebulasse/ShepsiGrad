import axios from 'axios';

// Используем OpenStreetMap Nominatim API (бесплатный сервис)
const NOMINATIM_API = 'https://nominatim.openstreetmap.org';

export interface GeocodingResult {
  address: string;
  latitude: number;
  longitude: number;
}

export interface NearbyPropertiesResult {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  price: number;
  priceMonthly: number;
  address: string;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
  distance: number;
}

// Функция для расчета дистанции по формуле гаверсинусов
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Расстояние в км
}

export const mapService = {
  // Геокодирование адреса (получение координат по адресу)
  geocodeAddress: async (address: string): Promise<GeocodingResult> => {
    try {
      // Используем Nominatim API для геокодирования
      const response = await axios.get(`${NOMINATIM_API}/search`, {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1
        },
        headers: {
          'Accept-Language': 'ru',
          'User-Agent': 'ShepsiGrad-App'
        }
      });

      if (response.data.length === 0) {
        throw new Error('Адрес не найден');
      }

      const result = response.data[0];
      return {
        address: result.display_name,
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  },

  // Обратное геокодирование (получение адреса по координатам)
  reverseGeocode: async (latitude: number, longitude: number): Promise<string> => {
    try {
      // Используем Nominatim API для обратного геокодирования
      const response = await axios.get(`${NOMINATIM_API}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'Accept-Language': 'ru',
          'User-Agent': 'ShepsiGrad-App'
        }
      });

      return response.data.display_name;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  },

  // Поиск недвижимости поблизости
  // Эта функция будет работать с нашим собственным бэкендом
  // Поскольку у нас нет готового бэкенда с данными, мы имитируем его работу с помощью локальной логики
  findNearbyProperties: async (
    latitude: number,
    longitude: number,
    radius: number = 5000
  ): Promise<NearbyPropertiesResult[]> => {
    try {
      // Имитация запроса к серверу
      // В реальном приложении мы бы вызвали API:
      // const response = await axios.get(`${API_URL}/maps/nearby`, { params: { latitude, longitude, radius } });

      // Создаем тестовые данные для демонстрации
      const mockProperties = [
        {
          id: '1',
          title: 'Уютная квартира в центре',
          description: 'Светлая и просторная квартира в историческом центре города. Рядом парки, кафе и магазины.',
          latitude: latitude + 0.01,
          longitude: longitude + 0.01,
          price: 3500, // цена за день
          priceMonthly: 85000, // цена за месяц
          address: 'ул. Ленина, 15, Москва',
          bedrooms: 2,
          bathrooms: 1,
          imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '2',
          title: 'Стильный лофт',
          description: 'Современный лофт с высокими потолками и большими окнами. Полностью меблирован.',
          latitude: latitude - 0.005,
          longitude: longitude + 0.007,
          price: 4200, // цена за день
          priceMonthly: 120000, // цена за месяц
          address: 'ул. Пушкина, 10, Москва',
          bedrooms: 1,
          bathrooms: 1,
          imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '3',
          title: 'Просторная квартира с видом на реку',
          description: 'Квартира с панорамным видом на реку. Есть балкон, кондиционер, Wi-Fi.',
          latitude: latitude + 0.003,
          longitude: longitude - 0.008,
          price: 5000, // цена за день
          priceMonthly: 140000, // цена за месяц
          address: 'Набережная ул., 5, Москва',
          bedrooms: 3,
          bathrooms: 2,
          imageUrl: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '4',
          title: 'Апартаменты премиум-класса',
          description: 'Роскошные апартаменты с дизайнерским ремонтом в элитном районе города.',
          latitude: latitude - 0.008,
          longitude: longitude - 0.003,
          price: 7500, // цена за день
          priceMonthly: 210000, // цена за месяц
          address: 'ул. Тверская, 22, Москва',
          bedrooms: 4,
          bathrooms: 2,
          imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: '5',
          title: 'Компактная студия',
          description: 'Небольшая, но функциональная студия в современном жилом комплексе.',
          latitude: latitude + 0.006,
          longitude: longitude + 0.004,
          price: 2800, // цена за день
          priceMonthly: 65000, // цена за месяц
          address: 'ул. Новая, 7, Москва',
          bedrooms: 1,
          bathrooms: 1,
          imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ];

      // Рассчитываем расстояние для каждого объекта
      const propertiesWithDistance = mockProperties.map(property => ({
        ...property,
        distance: calculateHaversineDistance(
          latitude,
          longitude,
          property.latitude,
          property.longitude
        )
      }));

      // Фильтруем по радиусу (конвертируем радиус из метров в км)
      return propertiesWithDistance
        .filter(property => property.distance <= radius / 1000)
        .sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error finding nearby properties:', error);
      throw error;
    }
  },

  // Расчет расстояния между двумя точками
  calculateDistance: async (
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<number> => {
    // Вместо обращения к API, используем формулу гаверсинусов для расчета расстояния
    return calculateHaversineDistance(originLat, originLng, destLat, destLng);
  }
};

export default mapService; 