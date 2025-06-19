import { Property, PropertyFilters } from '../types/property';
import { API_URL as BASE_API_URL } from '../config';

const API_URL = `${BASE_API_URL}/properties`;

export const propertyService = {
  async getProperties(filters?: PropertyFilters): Promise<{
    properties: Property[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await fetch(`${API_URL}?${queryParams.toString()}`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке объектов недвижимости');
    }
    const data = await response.json();
    return data;
  },

  async getPropertyById(id: string): Promise<Property> {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Ошибка при загрузке объекта недвижимости');
    }
    return response.json();
  },

  async createProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Ошибка при создании объекта недвижимости');
    }
    return response.json();
  },

  async updateProperty(id: string, property: Partial<Property>): Promise<Property> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(property),
    });
    if (!response.ok) {
      throw new Error('Ошибка при обновлении объекта недвижимости');
    }
    return response.json();
  },

  async deleteProperty(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Ошибка при удалении объекта недвижимости');
    }
  },
}; 