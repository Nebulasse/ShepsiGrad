import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getAllProperties, getFilteredProperties, Property } from './services/propertyService';
import { FilterOptions } from './types/FilterOptions';
import PropertyMapView from './components/map/PropertyMapView';
import FilterModal from './components/property/FilterModal';
import { useRouter } from 'expo-router';

// Создаем простой компонент карточки объекта недвижимости
const PropertyCard = ({ property, onPress }: { property: Property, onPress: (id: string) => void }) => {
  return (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => onPress(property.id)}
    >
      <View style={styles.propertyCardContent}>
        {property.imageUrl ? (
          <View style={styles.propertyImageContainer}>
            <Ionicons name="home" size={40} color="#007AFF" style={styles.propertyIcon} />
          </View>
        ) : (
          <View style={styles.propertyImageContainer}>
            <Ionicons name="home" size={40} color="#007AFF" style={styles.propertyIcon} />
          </View>
        )}
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyLocation}>{property.location}</Text>
          <Text style={styles.propertyPrice}>{property.price}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={styles.ratingText}>{property.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SearchScreen = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
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
  const [showFilters, setShowFilters] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 44.0321, // Шепси (примерные координаты)
    longitude: 39.1492,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Загрузка объектов недвижимости
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getAllProperties();
        setProperties(data);
        setFilteredProperties(data);
      } catch (error) {
        console.error('Ошибка при загрузке объектов:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Фильтрация объектов по поисковому запросу и фильтрам
  useEffect(() => {
    const applyFilters = async () => {
      try {
        setIsFiltering(true);
        
        // Создаем объект параметров поиска на основе текущих фильтров и текста поиска
        const searchParams = {
          ...filterOptions,
          query: searchText.trim() || undefined
        };
        
        // Вызываем API сервиса для получения отфильтрованных данных
        const filtered = await getFilteredProperties(searchParams);
        setFilteredProperties(filtered);
        
        // Подсчитываем количество активных фильтров
        let count = 0;
        
        if (filterOptions.priceMin > 0) count++;
        if (filterOptions.priceMax < 20000) count++;
        if (filterOptions.rooms > 0) count++;
        if (filterOptions.guests > 0) count++;
        if (filterOptions.rating > 0) count++;
        if (filterOptions.propertyType && filterOptions.propertyType !== 'all') count++;
        if (filterOptions.distanceToSea && filterOptions.distanceToSea < 5000) count++;
        if (filterOptions.hasParking) count++;
        if (filterOptions.hasWifi) count++;
        if (filterOptions.hasPool) count++;
        if (filterOptions.hasAirConditioning) count++;
        
        setActiveFiltersCount(count);
      } catch (error) {
        console.error('Ошибка при применении фильтров:', error);
      } finally {
        setIsFiltering(false);
      }
    };

    applyFilters();
  }, [searchText, filterOptions]);

  // Обработка изменения региона карты
  const handleRegionChange = (region: any) => {
    setMapRegion(region);
  };

  // Переключение между режимами просмотра
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'list' ? 'map' : 'list');
  };

  // Обработчик нажатия на карточку объекта
  const handlePropertyPress = (id: string) => {
    router.push(`/property/${id}`);
  };

  // Обработчик применения фильтров
  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setShowFilters(false);
  };

  // Если идет загрузка данных, показываем индикатор
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка объектов...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Поиск жилья</Text>
      </View>
      
      {/* Строка поиска */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по названию или месту"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={22} color="#007AFF" />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewToggle}
          onPress={toggleViewMode}
        >
          <Ionicons 
            name={viewMode === 'list' ? 'map-outline' : 'list-outline'} 
            size={24} 
            color="#007AFF" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Индикатор загрузки при фильтрации */}
      {isFiltering && (
        <View style={styles.filteringIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.filteringText}>Применение фильтров...</Text>
        </View>
      )}
      
      {/* Отображение результатов */}
      <View style={styles.contentContainer}>
        {viewMode === 'list' ? (
          // Отображение списка объектов
          <FlatList
            data={filteredProperties}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PropertyCard 
                property={item} 
                onPress={handlePropertyPress}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  Ничего не найдено по вашему запросу
                </Text>
                {activeFiltersCount > 0 && (
                  <TouchableOpacity 
                    style={styles.resetFiltersButton}
                    onPress={() => setFilterOptions({
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
                    })}
                  >
                    <Text style={styles.resetFiltersText}>Сбросить фильтры</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        ) : (
          // Отображение объектов на карте
          <PropertyMapView 
            properties={filteredProperties} 
            initialRegion={mapRegion}
            onRegionChange={handleRegionChange}
          />
        )}
      </View>
      
      {/* Модальное окно фильтров */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filterOptions}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  viewToggle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filteringIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  filteringText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  resetFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  resetFiltersText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  propertyCardContent: {
    flexDirection: 'row',
  },
  propertyImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  propertyIcon: {
    opacity: 0.5,
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SearchScreen; 