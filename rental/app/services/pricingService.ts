import axios from 'axios';
import { API_CONFIG } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы данных
export interface PriceRule {
  id: string;
  propertyId: string;
  name: string;
  startDate: string;
  endDate: string;
  priceModifier: number; // Множитель цены (1.5 = +50%, 0.8 = -20%)
  isActive: boolean;
  priority: number;
  type: 'seasonal' | 'weekend' | 'holiday' | 'lastMinute' | 'custom';
  createdAt: string;
  updatedAt: string;
}

export interface PriceSettings {
  basePrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  priceUnit: 'day' | 'night' | 'month';
  cleaningFee: number;
  serviceFee: number;
  discounts: {
    weekly: number; // Процент скидки при бронировании на неделю
    monthly: number; // Процент скидки при бронировании на месяц
    earlyBird: number; // Процент скидки при раннем бронировании
  };
}

export interface PricingData {
  date: string;
  price: number;
  available: boolean;
}

class PricingService {
  /**
   * Получение информации о ценах и доступности для объекта недвижимости
   */
  async getAvailabilityForProperty(propertyId: string): Promise<PricingData[]> {
    try {
      const response = await axios.get(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/availability`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении данных о доступности:', error);
      return [];
    }
  }

  /**
   * Обновление цены для конкретной даты
   */
  async updateDatePrice(propertyId: string, date: string, price: number): Promise<boolean> {
    try {
      await axios.post(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/pricing`, {
        date,
        price
      });
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении цены:', error);
      return false;
    }
  }

  /**
   * Обновление доступности для конкретной даты
   */
  async updateDateAvailability(propertyId: string, date: string, available: boolean): Promise<boolean> {
    try {
      await axios.post(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/availability`, {
        date,
        available
      });
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении доступности:', error);
      return false;
    }
  }

  /**
   * Массовое обновление цен для нескольких дат
   */
  async updateBulkPrices(propertyId: string, dates: string[], price: number): Promise<boolean> {
    try {
      await axios.post(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/bulk-pricing`, {
        dates,
        price
      });
      return true;
    } catch (error) {
      console.error('Ошибка при массовом обновлении цен:', error);
      return false;
    }
  }

  /**
   * Массовое обновление доступности для нескольких дат
   */
  async updateBulkAvailability(propertyId: string, dates: string[], available: boolean): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/bulk-availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dates, available }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Ошибка при массовом обновлении доступности для объекта ${propertyId}:`, error);
      return false;
    }
  }

  /**
   * Получение статистики по ценам за период
   */
  async getPriceStatistics(propertyId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const response = await axios.get(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-statistics`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении статистики по ценам:', error);
      return null;
    }
  }

  /**
   * Получение рекомендаций по ценам на основе рыночных данных
   */
  async getPriceRecommendations(propertyId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-recommendations`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении рекомендаций по ценам:', error);
      return null;
    }
  }

  /**
   * Установка сезонных цен
   */
  async setSeasonalPricing(propertyId: string, seasonData: any): Promise<boolean> {
    try {
      await axios.post(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/seasonal-pricing`, seasonData);
      return true;
    } catch (error) {
      console.error('Ошибка при установке сезонных цен:', error);
      return false;
    }
  }

  /**
   * Блокировка диапазона дат (установка недоступности)
   */
  async blockDateRange(propertyId: string, startDate: string, endDate: string, reason: string): Promise<boolean> {
    try {
      await axios.post(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/block-dates`, {
        startDate,
        endDate,
        reason
      });
      return true;
    } catch (error) {
      console.error('Ошибка при блокировке дат:', error);
      return false;
    }
  }

  /**
   * Получение токена авторизации
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Ошибка при получении токена авторизации:', error);
      return null;
    }
  }

  // Получение настроек цен для объекта недвижимости
  async getPriceSettings(propertyId: string): Promise<PriceSettings> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/pricing`, {
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
      console.error(`Ошибка при получении настроек цен для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Обновление настроек цен для объекта недвижимости
  async updatePriceSettings(propertyId: string, settings: Partial<PriceSettings>): Promise<PriceSettings> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/pricing`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при обновлении настроек цен для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Получение правил ценообразования для объекта
  async getPriceRules(propertyId: string): Promise<PriceRule[]> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-rules`, {
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
      return data.rules;
    } catch (error) {
      console.error(`Ошибка при получении правил цен для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Создание нового правила ценообразования
  async createPriceRule(propertyId: string, rule: Omit<PriceRule, 'id'>): Promise<PriceRule> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-rules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при создании правила цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Обновление правила ценообразования
  async updatePriceRule(propertyId: string, ruleId: string, rule: Partial<Omit<PriceRule, 'id'>>): Promise<PriceRule> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-rules/${ruleId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка при обновлении правила цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Удаление правила ценообразования
  async deletePriceRule(propertyId: string, ruleId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/price-rules/${ruleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Ошибка при удалении правила цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Расчет цены для конкретных дат
  async calculatePrice(propertyId: string, checkIn: string, checkOut: string, guests: number): Promise<{
    basePrice: number;
    totalPrice: number;
    breakdown: {
      nights: number;
      nightlyRate: number;
      cleaningFee: number;
      serviceFee: number;
      discount: number;
      appliedRules: { name: string; impact: number }[];
    };
  }> {
    try {
      const token = await this.getAuthToken();
      const url = new URL(`${API_CONFIG.baseUrl}/api/properties/${propertyId}/calculate-price`);
      url.searchParams.append('checkIn', checkIn);
      url.searchParams.append('checkOut', checkOut);
      url.searchParams.append('guests', guests.toString());

      const response = await fetch(url.toString(), {
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
      console.error(`Ошибка при расчете цены для объекта ${propertyId}:`, error);
      throw error;
    }
  }
}

export const pricingService = new PricingService();

// Добавляем пустой компонент по умолчанию для expo-router
export default function PricingServiceComponent() {
  return null;
} 