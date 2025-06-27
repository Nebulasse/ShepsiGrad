import axios from 'axios';
import { API_CONFIG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncService, SyncChannel } from './syncService';

// Типы данных для объектов недвижимости
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price_per_day: number;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  status: 'active' | 'inactive' | 'maintenance';
  amenities?: string[];
  rules?: string[];
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  created_at: string;
}

export interface PropertyFilters {
  city?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  min_guests?: number;
  amenities?: string[];
  page?: number;
  limit?: number;
}

export interface PropertyAvailability {
  property_id: string;
  date: string;
  is_available: boolean;
  price_override?: number;
}

export interface PriceSettings {
  property_id: string;
  base_price: number;
  weekend_price?: number;
  weekly_discount?: number;
  monthly_discount?: number;
  min_stay?: number;
  max_stay?: number;
  seasonal_prices?: SeasonalPrice[];
}

export interface SeasonalPrice {
  id?: string;
  property_id: string;
  start_date: string;
  end_date: string;
  price: number;
  name: string;
}

class PropertyService {
  private apiUrl = `${API_CONFIG.baseUrl}/api/properties`;
  
  // Получение заголовков авторизации
  private async getHeaders() {
    const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Получение списка объектов недвижимости арендодателя
  async getLandlordProperties(): Promise<Property[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/landlord`, { headers });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении объектов недвижимости:', error);
      throw error;
    }
  }

  // Получение детальной информации об объекте
  async getPropertyById(id: string): Promise<Property> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/${id}`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Создание нового объекта недвижимости
  async createProperty(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>): Promise<Property> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(this.apiUrl, propertyData, { headers });
      
      // Уведомляем о создании нового объекта
      syncService.publish(SyncChannel.PROPERTY_UPDATE, 'create', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании объекта недвижимости:', error);
      throw error;
    }
  }

  // Обновление объекта недвижимости
  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.apiUrl}/${id}`, propertyData, { headers });
      
      // Уведомляем об обновлении объекта
      syncService.publish(SyncChannel.PROPERTY_UPDATE, 'update', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Удаление объекта недвижимости
  async deleteProperty(id: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${this.apiUrl}/${id}`, { headers });
      
      // Уведомляем об удалении объекта
      syncService.publish(SyncChannel.PROPERTY_UPDATE, 'delete', { id });
    } catch (error) {
      console.error(`Ошибка при удалении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Загрузка изображений для объекта недвижимости
  async uploadPropertyImages(propertyId: string, images: Array<{ uri: string; type: string; name: string }>): Promise<PropertyImage[]> {
    try {
      const headers = await this.getHeaders();
      const formData = new FormData();
      
      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `image-${index}.jpg`
        } as any);
      });
      
      const response = await axios.post(
        `${this.apiUrl}/${propertyId}/images`, 
        formData, 
        { 
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Ошибка при загрузке изображений для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Удаление изображения
  async deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${this.apiUrl}/${propertyId}/images/${imageId}`, { headers });
    } catch (error) {
      console.error(`Ошибка при удалении изображения ${imageId}:`, error);
      throw error;
    }
  }

  // Установка главного изображения
  async setPrimaryImage(propertyId: string, imageId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.put(`${this.apiUrl}/${propertyId}/images/${imageId}/primary`, {}, { headers });
    } catch (error) {
      console.error(`Ошибка при установке главного изображения ${imageId}:`, error);
      throw error;
    }
  }

  // Получение доступности объекта
  async getPropertyAvailability(propertyId: string, startDate: string, endDate: string): Promise<PropertyAvailability[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/${propertyId}/availability`, { 
        headers,
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении доступности объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Обновление доступности объекта
  async updatePropertyAvailability(propertyId: string, dates: PropertyAvailability[]): Promise<PropertyAvailability[]> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.apiUrl}/${propertyId}/availability`, { dates }, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении доступности объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Получение настроек цены
  async getPriceSettings(propertyId: string): Promise<PriceSettings> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.apiUrl}/${propertyId}/pricing`, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении настроек цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Обновление настроек цены
  async updatePriceSettings(propertyId: string, settings: Partial<PriceSettings>): Promise<PriceSettings> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.put(`${this.apiUrl}/${propertyId}/pricing`, settings, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении настроек цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Добавление сезонной цены
  async addSeasonalPrice(propertyId: string, seasonalPrice: Omit<SeasonalPrice, 'id'>): Promise<SeasonalPrice> {
    try {
      const headers = await this.getHeaders();
      const response = await axios.post(`${this.apiUrl}/${propertyId}/pricing/seasonal`, seasonalPrice, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при добавлении сезонной цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Удаление сезонной цены
  async deleteSeasonalPrice(propertyId: string, seasonalPriceId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      await axios.delete(`${this.apiUrl}/${propertyId}/pricing/seasonal/${seasonalPriceId}`, { headers });
    } catch (error) {
      console.error(`Ошибка при удалении сезонной цены ${seasonalPriceId}:`, error);
      throw error;
    }
  }
}

export const propertyService = new PropertyService(); 