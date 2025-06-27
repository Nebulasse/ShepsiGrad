import api from './api';

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  status: 'pending' | 'approved' | 'rejected';
  owner: {
    id: string;
    name: string;
    email: string;
  };
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFilters {
  status?: string;
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  limit?: number;
}

export interface PropertyResponse {
  properties: Property[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const propertyService = {
  /**
   * Получить все объекты недвижимости с фильтрацией
   */
  async getAllProperties(filters: PropertyFilters = {}): Promise<PropertyResponse> {
    try {
      const response = await api.get('/properties', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении объектов недвижимости:', error);
      throw error;
    }
  },

  /**
   * Получить объект недвижимости по ID
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении объекта недвижимости с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Подтвердить объект недвижимости
   */
  async approveProperty(id: string): Promise<Property> {
    try {
      const response = await api.patch(`/properties/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при подтверждении объекта недвижимости с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Отклонить объект недвижимости
   */
  async rejectProperty(id: string, reason: string): Promise<Property> {
    try {
      const response = await api.patch(`/properties/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при отклонении объекта недвижимости с ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Получить статистику по объектам недвижимости
   */
  async getPropertyStats(): Promise<any> {
    try {
      const response = await api.get('/properties/stats');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении статистики по объектам недвижимости:', error);
      throw error;
    }
  },

  /**
   * Получить объекты недвижимости, требующие модерации
   */
  async getPropertiesForModeration(): Promise<Property[]> {
    try {
      const response = await api.get('/properties/moderation');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении объектов для модерации:', error);
      throw error;
    }
  }
};

export default propertyService; 