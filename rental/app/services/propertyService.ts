import { API_URL } from '../config';

// Типы данных
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  priceUnit: 'day' | 'night' | 'month';
  rooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  images: string[];
  ownerId: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  price: number;
  priceUnit: 'day' | 'night' | 'month';
  rooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
}

class PropertyService {
  // Получение всех объектов недвижимости арендодателя
  async getProperties(): Promise<Property[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/owner`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      return data.properties;
    } catch (error) {
      console.error('Ошибка при получении объектов недвижимости:', error);
      throw error;
    }
  }

  // Получение детальной информации об объекте недвижимости
  async getPropertyById(id: string): Promise<Property> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при получении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Создание нового объекта недвижимости
  async createProperty(propertyData: PropertyFormData): Promise<Property> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка при создании объекта недвижимости:', error);
      throw error;
    }
  }

  // Обновление объекта недвижимости
  async updateProperty(id: string, propertyData: Partial<PropertyFormData>): Promise<Property> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при обновлении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Удаление объекта недвижимости
  async deleteProperty(id: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении объекта недвижимости ${id}:`, error);
      throw error;
    }
  }

  // Загрузка изображений для объекта недвижимости
  async uploadPropertyImages(propertyId: string, images: FormData): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: images,
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      return data.imageUrls;
    } catch (error) {
      console.error(`Ошибка при загрузке изображений для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Получение токена авторизации (заглушка, нужно будет реализовать с AuthService)
  private async getAuthToken(): Promise<string> {
    // Здесь должна быть логика получения токена из хранилища или AuthService
    return 'dummy-token';
  }
}

export const propertyService = new PropertyService(); 