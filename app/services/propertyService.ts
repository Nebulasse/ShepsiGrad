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

// Функция для тестирования создания объекта недвижимости и синхронизации
export async function testPropertySync(): Promise<{success: boolean, property?: Property, error?: string}> {
  try {
    // Получаем токен авторизации
    const token = await AsyncStorage.getItem('shepsigrad_landlord_token');
    
    if (!token) {
      return { 
        success: false, 
        error: 'Не найден токен авторизации. Пожалуйста, войдите в систему.' 
      };
    }
    
    // Создаем тестовый объект недвижимости
    const testProperty = {
      title: `Тест синхронизации ${new Date().toISOString()}`,
      description: 'Этот объект создан для тестирования синхронизации между приложениями',
      address: 'ул. Тестовая, 123',
      city: 'Шепси',
      price_per_day: 3500,
      property_type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      max_guests: 4,
      amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
      rules: ['Не курить'],
      status: 'active'
    };
    
    // Отправляем запрос на создание объекта
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    const response = await axios.post(
      `${API_CONFIG.baseUrl}/api/properties`, 
      testProperty, 
      { headers }
    );
    
    const createdProperty = response.data;
    
    // Уведомляем о создании нового объекта через syncService
    syncService.publish(
      SyncChannel.PROPERTY_UPDATE, 
      'create', 
      createdProperty, 
      ['tenant-app']
    );
    
    console.log('Тестовый объект успешно создан:', createdProperty);
    
    // Ждем некоторое время для синхронизации
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Проверяем наличие объекта в общей базе данных через API приложения съемщика
    const checkResponse = await axios.get(
      `${API_CONFIG.baseUrl}/api/properties/${createdProperty.id}`,
      { 
        headers: {
          ...headers,
          'X-App-Type': 'tenant'
        } 
      }
    );
    
    if (checkResponse.data && checkResponse.data.id === createdProperty.id) {
      console.log('Синхронизация успешна! Объект найден в общей базе данных');
      return {
        success: true,
        property: createdProperty
      };
    } else {
      return {
        success: false,
        property: createdProperty,
        error: 'Объект создан, но не найден в общей базе данных'
      };
    }
  } catch (error) {
    console.error('Ошибка при тестировании синхронизации:', error);
    return {
      success: false,
      error: `Ошибка: ${error.response?.data?.message || error.message}`
    };
  }
} 