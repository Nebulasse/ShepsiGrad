import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { FilterOptions } from '../../types/FilterOptions';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({ 
  visible, 
  onClose, 
  onApply,
  initialFilters 
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  
  // Сброс фильтров при открытии модального окна
  useEffect(() => {
    if (visible) {
      setFilters(initialFilters);
    }
  }, [visible, initialFilters]);

  // Обработчик изменения числовых значений
  const handleSliderChange = (key: keyof FilterOptions, value: number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Обработчик изменения булевых значений
  const handleSwitchChange = (key: keyof FilterOptions, value: boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Обработчик изменения типа жилья
  const handlePropertyTypeChange = (type: FilterOptions['propertyType']) => {
    setFilters(prev => ({ ...prev, propertyType: type }));
  };

  // Обработчик изменения сортировки
  const handleSortChange = (sort: FilterOptions['sort']) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  // Сброс всех фильтров
  const handleReset = () => {
    setFilters({
      priceMin: 0,
      priceMax: 20000,
      rooms: 0,
      guests: 0,
      rating: 0,
      propertyType: 'all',
      distanceToSea: 5000,
      hasParking: false,
      hasWifi: false,
      hasPool: false,
      hasAirConditioning: false,
      sort: 'rating'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Фильтры</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Сбросить</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Фильтр по цене */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Цена за сутки</Text>
            <View style={styles.priceRangeContainer}>
              <Text style={styles.priceValue}>{filters.priceMin} ₽</Text>
              <Text style={styles.priceValue}>{filters.priceMax} ₽</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={20000}
              step={500}
              value={filters.priceMin}
              onValueChange={(value) => handleSliderChange('priceMin', value)}
              minimumTrackTintColor="#0075FF"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#0075FF"
            />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={20000}
              step={500}
              value={filters.priceMax}
              onValueChange={(value) => handleSliderChange('priceMax', value)}
              minimumTrackTintColor="#0075FF"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#0075FF"
            />
          </View>

          {/* Фильтр по типу недвижимости */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Тип жилья</Text>
            <View style={styles.propertyTypeContainer}>
              {['all', 'apartment', 'house', 'villa', 'room'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.propertyTypeButton,
                    filters.propertyType === type && styles.propertyTypeButtonActive
                  ]}
                  onPress={() => handlePropertyTypeChange(type as FilterOptions['propertyType'])}
                >
                  <Text 
                    style={[
                      styles.propertyTypeText,
                      filters.propertyType === type && styles.propertyTypeTextActive
                    ]}
                  >
                    {getPropertyTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Фильтр по количеству комнат */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Количество комнат</Text>
            <View style={styles.roomsContainer}>
              {[0, 1, 2, 3, 4].map((room) => (
                <TouchableOpacity
                  key={room}
                  style={[
                    styles.roomButton,
                    filters.rooms === room && styles.roomButtonActive
                  ]}
                  onPress={() => handleSliderChange('rooms', room)}
                >
                  <Text 
                    style={[
                      styles.roomButtonText,
                      filters.rooms === room && styles.roomButtonTextActive
                    ]}
                  >
                    {room === 0 ? 'Любое' : room === 4 ? '4+' : room}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Фильтр по количеству гостей */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Количество гостей</Text>
            <View style={styles.roomsContainer}>
              {[0, 1, 2, 3, 4, 5, 6].map((guest) => (
                <TouchableOpacity
                  key={guest}
                  style={[
                    styles.guestButton,
                    filters.guests === guest && styles.guestButtonActive
                  ]}
                  onPress={() => handleSliderChange('guests', guest)}
                >
                  <Text 
                    style={[
                      styles.guestButtonText,
                      filters.guests === guest && styles.guestButtonTextActive
                    ]}
                  >
                    {guest === 0 ? 'Любое' : guest === 6 ? '6+' : guest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Фильтр по расстоянию до моря */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Расстояние до моря</Text>
            <View style={styles.distanceContainer}>
              <Text style={styles.distanceValue}>
                {filters.distanceToSea && filters.distanceToSea < 1000 
                  ? `${filters.distanceToSea} м` 
                  : `${(filters.distanceToSea || 0) / 1000} км`}
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={100}
              maximumValue={5000}
              step={100}
              value={filters.distanceToSea || 5000}
              onValueChange={(value) => handleSliderChange('distanceToSea', value)}
              minimumTrackTintColor="#0075FF"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#0075FF"
            />
          </View>

          {/* Фильтры по удобствам */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Удобства</Text>
            <View style={styles.amenitiesContainer}>
              <View style={styles.amenityRow}>
                <Text style={styles.amenityText}>Wi-Fi</Text>
                <Switch
                  value={filters.hasWifi || false}
                  onValueChange={(value) => handleSwitchChange('hasWifi', value)}
                  trackColor={{ false: '#d3d3d3', true: '#bde0ff' }}
                  thumbColor={filters.hasWifi ? '#0075FF' : '#f4f3f4'}
                />
              </View>
              <View style={styles.amenityRow}>
                <Text style={styles.amenityText}>Парковка</Text>
                <Switch
                  value={filters.hasParking || false}
                  onValueChange={(value) => handleSwitchChange('hasParking', value)}
                  trackColor={{ false: '#d3d3d3', true: '#bde0ff' }}
                  thumbColor={filters.hasParking ? '#0075FF' : '#f4f3f4'}
                />
              </View>
              <View style={styles.amenityRow}>
                <Text style={styles.amenityText}>Бассейн</Text>
                <Switch
                  value={filters.hasPool || false}
                  onValueChange={(value) => handleSwitchChange('hasPool', value)}
                  trackColor={{ false: '#d3d3d3', true: '#bde0ff' }}
                  thumbColor={filters.hasPool ? '#0075FF' : '#f4f3f4'}
                />
              </View>
              <View style={styles.amenityRow}>
                <Text style={styles.amenityText}>Кондиционер</Text>
                <Switch
                  value={filters.hasAirConditioning || false}
                  onValueChange={(value) => handleSwitchChange('hasAirConditioning', value)}
                  trackColor={{ false: '#d3d3d3', true: '#bde0ff' }}
                  thumbColor={filters.hasAirConditioning ? '#0075FF' : '#f4f3f4'}
                />
              </View>
            </View>
          </View>

          {/* Сортировка */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Сортировка</Text>
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  filters.sort === 'price_asc' && styles.sortButtonActive
                ]}
                onPress={() => handleSortChange('price_asc')}
              >
                <Text 
                  style={[
                    styles.sortButtonText,
                    filters.sort === 'price_asc' && styles.sortButtonTextActive
                  ]}
                >
                  Сначала дешевле
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  filters.sort === 'price_desc' && styles.sortButtonActive
                ]}
                onPress={() => handleSortChange('price_desc')}
              >
                <Text 
                  style={[
                    styles.sortButtonText,
                    filters.sort === 'price_desc' && styles.sortButtonTextActive
                  ]}
                >
                  Сначала дороже
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  filters.sort === 'rating' && styles.sortButtonActive
                ]}
                onPress={() => handleSortChange('rating')}
              >
                <Text 
                  style={[
                    styles.sortButtonText,
                    filters.sort === 'rating' && styles.sortButtonTextActive
                  ]}
                >
                  По рейтингу
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortButton,
                  filters.sort === 'distance' && styles.sortButtonActive
                ]}
                onPress={() => handleSortChange('distance')}
              >
                <Text 
                  style={[
                    styles.sortButtonText,
                    filters.sort === 'distance' && styles.sortButtonTextActive
                  ]}
                >
                  Ближе к морю
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={() => onApply(filters)}
          >
            <Text style={styles.applyButtonText}>Применить фильтры</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Вспомогательная функция для получения названия типа жилья
const getPropertyTypeLabel = (type: string): string => {
  switch (type) {
    case 'all': return 'Все';
    case 'apartment': return 'Квартиры';
    case 'house': return 'Дома';
    case 'villa': return 'Виллы';
    case 'room': return 'Комнаты';
    default: return type;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetText: {
    fontSize: 14,
    color: '#0075FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 14,
    color: '#666',
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  propertyTypeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  propertyTypeButtonActive: {
    backgroundColor: '#0075FF',
    borderColor: '#0075FF',
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#333',
  },
  propertyTypeTextActive: {
    color: '#fff',
  },
  roomsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  roomButtonActive: {
    backgroundColor: '#0075FF',
    borderColor: '#0075FF',
  },
  roomButtonText: {
    fontSize: 14,
    color: '#333',
  },
  roomButtonTextActive: {
    color: '#fff',
  },
  guestButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  guestButtonActive: {
    backgroundColor: '#0075FF',
    borderColor: '#0075FF',
  },
  guestButtonText: {
    fontSize: 14,
    color: '#333',
  },
  guestButtonTextActive: {
    color: '#fff',
  },
  distanceContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 14,
    color: '#666',
  },
  amenitiesContainer: {
    marginTop: 8,
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  amenityText: {
    fontSize: 16,
    color: '#333',
  },
  sortContainer: {
    marginTop: 8,
  },
  sortButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  sortButtonActive: {
    backgroundColor: '#0075FF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#333',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FilterModal; 