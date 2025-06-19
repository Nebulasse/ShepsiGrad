import axios from 'axios';
import { API_URL } from '../config';

// Типы данных
export interface Favorite {
  _id: string;
  user: string;
  property: any; // Можно заменить на более конкретный тип Property
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFavorites {
  data: Favorite[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Сервис для работы с избранными объектами
export const favoriteService = {
  // Получить список избранных объектов
  async getFavorites(page = 1, limit = 10): Promise<PaginatedFavorites> {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_URL}/favorites`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  },
  
  // Добавить объект в избранное
  async addToFavorites(propertyId: string): Promise<Favorite> {
    const token = localStorage.getItem('token');
    
    const response = await axios.post(`${API_URL}/favorites`, 
      { propertyId },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    return response.data.data;
  },
  
  // Удалить объект из избранного
  async removeFromFavorites(propertyId: string): Promise<void> {
    const token = localStorage.getItem('token');
    
    await axios.delete(`${API_URL}/favorites/${propertyId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  
  // Проверить, добавлен ли объект в избранное
  async checkIsFavorite(propertyId: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    
    if (!token) return false;
    
    try {
      const response = await axios.get(`${API_URL}/favorites/${propertyId}/check`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.isFavorite;
    } catch (error) {
      console.error('Ошибка при проверке статуса избранного:', error);
      return false;
    }
  }
}; 