import { API_URL } from '../config';

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

class PricingService {
  // Получение настроек цен для объекта недвижимости
  async getPriceSettings(propertyId: string): Promise<PriceSettings> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/pricing`, {
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
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/pricing`, {
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
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/price-rules`, {
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
  async createPriceRule(propertyId: string, rule: Omit<PriceRule, 'id' | 'propertyId' | 'createdAt' | 'updatedAt'>): Promise<PriceRule> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/price-rules`, {
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
      console.error(`Ошибка при создании правила цен для объекта ${propertyId}:`, error);
      throw error;
    }
  }

  // Обновление правила ценообразования
  async updatePriceRule(propertyId: string, ruleId: string, rule: Partial<PriceRule>): Promise<PriceRule> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/price-rules/${ruleId}`, {
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
      console.error(`Ошибка при обновлении правила цен ${ruleId}:`, error);
      throw error;
    }
  }

  // Удаление правила ценообразования
  async deletePriceRule(propertyId: string, ruleId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_URL}/api/properties/${propertyId}/price-rules/${ruleId}`, {
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
      console.error(`Ошибка при удалении правила цен ${ruleId}:`, error);
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
      const url = new URL(`${API_URL}/api/properties/${propertyId}/calculate-price`);
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

  // Получение токена авторизации (заглушка, нужно будет реализовать с AuthService)
  private async getAuthToken(): Promise<string> {
    // Здесь должна быть логика получения токена из хранилища или AuthService
    return 'dummy-token';
  }
}

export const pricingService = new PricingService(); 