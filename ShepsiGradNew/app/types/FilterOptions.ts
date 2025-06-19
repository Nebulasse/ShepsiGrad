// Интерфейс для опций фильтрации объектов недвижимости
export interface FilterOptions {
  priceMin: number;
  priceMax: number;
  rooms: number;
  guests: number;
  rating: number;
  amenities?: string[];
  propertyType?: 'apartment' | 'house' | 'villa' | 'room' | 'all';
  distanceToSea?: number; // в метрах
  hasParking?: boolean;
  hasWifi?: boolean;
  hasPool?: boolean;
  hasAirConditioning?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'distance';
}

// Default экспорт для избежания предупреждений expo-router
export default FilterOptions; 