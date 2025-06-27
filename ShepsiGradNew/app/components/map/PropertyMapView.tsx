import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator, Modal, ScrollView, FlatList, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Property } from '../../services/propertyService';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';

// Определяем тип Region для корректной работы
interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

interface PropertyMapViewProps {
  properties: Property[];
  initialRegion?: Region;
  onRegionChange?: (region: Region) => void;
  onFilterChange?: (filters: MapFilters) => void;
}

// Интерфейс для фильтров карты
interface MapFilters {
  priceMin: number;
  priceMax: number;
  propertyType: string;
  distanceToSea: number;
  rating: number;
  showOnlyWithPhotos: boolean;
}

// Компонент-заглушка для отображения, когда карта не может быть загружена
const MapPlaceholder = ({ onRetry }: { onRetry: () => void }) => (
  <View style={styles.mapPlaceholder}>
    <Ionicons name="map-outline" size={80} color="#ccc" />
    <Text style={styles.mapPlaceholderTitle}>Карта недоступна</Text>
    <Text style={styles.mapPlaceholderText}>
      Не удалось загрузить карту. Проверьте подключение к интернету.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Повторить</Text>
    </TouchableOpacity>
  </View>
);

// Компонент карточки объекта недвижимости
const PropertyCard = ({ property, onClose, onPress }: { property: Property, onClose: () => void, onPress: () => void }) => (
  <View style={styles.propertyCardContainer}>
    <TouchableOpacity style={styles.propertyCard} onPress={onPress}>
      <Image 
        source={{ uri: property.imageUrl }} 
        style={styles.propertyImage} 
        resizeMode="cover"
      />
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{property.title}</Text>
        <Text style={styles.propertyPrice}>{property.price}</Text>
        <Text style={styles.propertyAddress}>{property.location}</Text>
        
        <View style={styles.propertyDetails}>
          <Text style={styles.propertyDetail}>
            {property.area} м² • {property.type === 'apartment' ? 'Квартира' : 'Дом'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text style={styles.ratingText}>{property.rating}</Text>
          </View>
        </View>
        
        <View style={styles.cardButtons}>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={14} color="#fff" />
            <Text style={styles.buttonText}>Позвонить</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton}>
            <Ionicons name="chatbubble-outline" size={14} color="#0066CC" />
            <Text style={styles.messageText}>Написать</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  </View>
);

// Компонент для отображения группы объектов
const PropertyGroupList = ({ properties, onClose, onSelect }: { 
  properties: Property[], 
  onClose: () => void, 
  onSelect: (property: Property) => void 
}) => (
  <View style={styles.propertyGroupContainer}>
    <View style={styles.propertyGroupHeader}>
      <Text style={styles.propertyGroupTitle}>Объекты в этом районе ({properties.length})</Text>
      <TouchableOpacity onPress={onClose}>
        <Ionicons name="close" size={24} color="#999" />
      </TouchableOpacity>
    </View>
    
    <FlatList
      data={properties}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.propertyGroupItem}
          onPress={() => onSelect(item)}
        >
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.propertyGroupImage} 
            resizeMode="cover"
          />
          <View style={styles.propertyGroupInfo}>
            <Text style={styles.propertyGroupItemTitle}>{item.title}</Text>
            <Text style={styles.propertyGroupItemPrice}>{item.price}</Text>
            <View style={styles.propertyGroupItemRating}>
              <Ionicons name="star" size={12} color="#FFC107" />
              <Text style={styles.propertyGroupItemRatingText}>{item.rating}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
      style={styles.propertyGroupList}
    />
  </View>
);

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  initialRegion,
  onRegionChange,
  onFilterChange
}) => {
  const router = useRouter();
  const [currentRegion, setCurrentRegion] = useState<Region>({
    latitude: 44.0321, // Шепси (примерные координаты)
    longitude: 39.1492,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [groupProperties, setGroupProperties] = useState<Property[] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const [propertiesChanged, setPropertiesChanged] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<MapFilters>({
    priceMin: 0,
    priceMax: 20000,
    propertyType: 'all',
    distanceToSea: 5000,
    rating: 0,
    showOnlyWithPhotos: false
  });

  // Получаем начальное местоположение пользователя
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationPermissionDenied(true);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        // Если не задан initialRegion, используем местоположение пользователя
        if (!initialRegion) {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          };
          setCurrentRegion(newRegion);
          if (onRegionChange) {
            onRegionChange(newRegion);
          }
        }
      } catch (error) {
        console.error('Ошибка при получении местоположения:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Используем initialRegion, если он предоставлен
  useEffect(() => {
    if (initialRegion) {
      setCurrentRegion(initialRegion);
    }
  }, [initialRegion]);

  // Отслеживаем изменения в списке объектов
  useEffect(() => {
    // Если карта уже загружена, обновляем маркеры при изменении списка объектов
    if (mapLoaded && webViewRef.current) {
      console.log('Обновление объектов на карте');
      setPropertiesChanged(true);
      
      // Отправляем новые данные в WebView
      const validProperties = properties.filter(p => p.latitude && p.longitude);
      webViewRef.current.injectJavaScript(`
        try {
          // Обновляем список объектов без перерисовки всей карты
          if (typeof window.updatePropertiesWithoutRedraw === 'function') {
            window.updatePropertiesWithoutRedraw(${JSON.stringify(validProperties)});
          } else {
            window.updateProperties(${JSON.stringify(validProperties)});
          }
          true;
        } catch (e) {
          console.error('Ошибка при обновлении объектов:', e);
          false;
        }
      `);
    }
  }, [properties, mapLoaded]);

  // Обработчик нажатия на объект недвижимости
  const handlePropertyPress = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setGroupProperties(null);
    }
  };

  // Обработчик нажатия на группу объектов
  const handleGroupPress = (location: string) => {
    const propertiesInGroup = properties.filter(p => p.location === location);
    if (propertiesInGroup.length > 0) {
      setGroupProperties(propertiesInGroup);
      setSelectedProperty(null);
    }
  };

  // Переход к странице объявления
  const handleNavigateToProperty = () => {
    if (selectedProperty) {
      router.push(`/property/${selectedProperty.id}`);
      setSelectedProperty(null);
    }
  };

  // Выбор объекта из группы
  const handleSelectFromGroup = (property: Property) => {
    setSelectedProperty(property);
    setGroupProperties(null);
  };

  // Обработчик изменения фильтров
  const handleFilterChange = (newFilters: Partial<MapFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Уведомляем родительский компонент об изменении фильтров
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  // Применение фильтров
  const applyFilters = () => {
    setShowFilters(false);
    
    // Отправляем фильтры в WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        try {
          if (typeof window.applyFilters === 'function') {
            window.applyFilters(${JSON.stringify(filters)});
          }
          true;
        } catch (e) {
          console.error('Ошибка при применении фильтров:', e);
          false;
        }
      `);
    }
  };

  // Сброс фильтров
  const resetFilters = () => {
    const defaultFilters = {
      priceMin: 0,
      priceMax: 20000,
      propertyType: 'all',
      distanceToSea: 5000,
      rating: 0,
      showOnlyWithPhotos: false
    };
    
    setFilters(defaultFilters);
    
    // Уведомляем родительский компонент о сбросе фильтров
    if (onFilterChange) {
      onFilterChange(defaultFilters);
    }
    
    // Отправляем сброс фильтров в WebView
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        try {
          if (typeof window.resetFilters === 'function') {
            window.resetFilters();
          }
          true;
        } catch (e) {
          console.error('Ошибка при сбросе фильтров:', e);
          false;
        }
      `);
    }
  };

  // Обработчик сообщений от WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'regionChange') {
        const newRegion = {
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setCurrentRegion(newRegion);
        if (onRegionChange) {
          onRegionChange(newRegion);
        }
      } else if (data.type === 'markerClick') {
        handlePropertyPress(data.propertyId);
      } else if (data.type === 'groupClick') {
        handleGroupPress(data.location);
      } else if (data.type === 'mapLoaded') {
        setMapLoaded(true);
      } else if (data.type === 'filterClick') {
        setShowFilters(true);
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения от WebView:', error);
    }
  };

  // Обработчик ошибок WebView
  const handleWebViewError = () => {
    setError(true);
    setLoading(false);
  };

  // Повторная попытка загрузки карты
  const retryLoadMap = () => {
    setError(false);
    setLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  // HTML-код для карты с использованием Яндекс Карт
  const getMapHTML = () => {
    // Фильтруем объекты с координатами
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    
    // Преобразуем объекты в JSON для передачи в WebView
    const propertiesJSON = JSON.stringify(validProperties);
    const filtersJSON = JSON.stringify(filters);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://api-maps.yandex.ru/2.1/?apikey=de443c96-abb5-4c59-a485-cd1bd71430a5&lang=ru_RU" type="text/javascript"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          #map {
            width: 100%;
            height: 100vh;
            transition: opacity 0.3s ease-in-out;
          }
          .map-loading {
            opacity: 0;
          }
          .location-group {
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 8px;
            padding: 8px;
            position: absolute;
            bottom: 16px;
            left: 16px;
            z-index: 1000;
            max-width: 80%;
          }
          .location-count {
            font-weight: bold;
            margin-bottom: 8px;
          }
          .filters {
            position: absolute;
            top: 16px;
            right: 16px;
            z-index: 1000;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            padding: 10px;
            cursor: pointer;
          }
          .filter-button {
            display: flex;
            align-items: center;
            padding: 8px 10px;
            border-radius: 20px;
            background-color: white;
            font-size: 13px;
            font-family: Arial, sans-serif;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            color: #333;
          }
          .filter-icon {
            margin-right: 5px;
          }
          .filter-badge {
            display: inline-block;
            background-color: #007AFF;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            text-align: center;
            line-height: 18px;
            font-size: 12px;
            margin-left: 5px;
          }
        </style>
      </head>
      <body>
        <div id="map" class="map-loading"></div>
        <script>
          // Получаем данные о недвижимости
          const properties = ${propertiesJSON};
          
          // Получаем фильтры
          let currentFilters = ${filtersJSON};
          
          // Группируем объекты по местоположению
          const locationGroups = {};
          properties.forEach(property => {
            const locationKey = property.location;
            if (!locationGroups[locationKey]) {
              locationGroups[locationKey] = [];
            }
            locationGroups[locationKey].push(property);
          });
          
          // Инициализируем карту после загрузки API
          ymaps.ready(init);
          
          let map;
          let objectManager;
          let filteredProperties = [...properties]; // Копируем массив объектов
          
          function init() {
            // Создаем карту
            map = new ymaps.Map('map', {
              center: [${currentRegion.latitude}, ${currentRegion.longitude}],
              zoom: 13,
              controls: ['zoomControl']
            }, {
              // Оптимизируем отображение карты
              yandexMapDisablePoiInteractivity: true,
              suppressMapOpenBlock: true
            });
            
            // Создаем менеджер объектов для эффективного отображения маркеров
            objectManager = new ymaps.ObjectManager({
              clusterize: true,
              gridSize: 32,
              clusterDisableClickZoom: false
            });
            
            // Настраиваем внешний вид кластеров
            objectManager.clusters.options.set({
              preset: 'islands#blueClusterIcons',
              hasBalloon: false
            });
            
            // Добавляем менеджер объектов на карту
            map.geoObjects.add(objectManager);
            
            // Добавляем объекты на карту
            addPropertiesToMap(properties);
            
            // Показываем карту
            document.getElementById('map').classList.remove('map-loading');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
            
            // Добавляем элемент с фильтрами
            const filtersElement = document.createElement('div');
            filtersElement.className = 'filters';
            
            // Получаем количество активных фильтров
            const activeFiltersCount = getActiveFiltersCount();
            
            filtersElement.innerHTML = \`
              <div class="filter-button">
                <span class="filter-icon">⚙️</span>
                Фильтры
                \${activeFiltersCount > 0 ? \`<span class="filter-badge">\${activeFiltersCount}</span>\` : ''}
              </div>
            \`;
            
            // Добавляем обработчик клика на кнопку фильтров
            filtersElement.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'filterClick'
              }));
            });
            
            document.body.appendChild(filtersElement);
            
            // Обработчик изменения центра карты
            map.events.add('boundschange', function() {
              const center = map.getCenter();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                latitude: center[0],
                longitude: center[1]
              }));
            });
            
            // Обработчик клика по кластеру
            objectManager.clusters.events.add('click', function(e) {
              const objectId = e.get('objectId');
              const cluster = objectManager.clusters.getById(objectId);
              
              if (cluster) {
                const objects = cluster.features;
                if (objects.length > 0) {
                  const firstObject = objects[0];
                  const location = firstObject.properties.location;
                  
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'groupClick',
                    location: location
                  }));
                }
              }
            });
            
            // Обработчик клика по объекту
            objectManager.objects.events.add('click', function(e) {
              const objectId = e.get('objectId');
              const object = objectManager.objects.getById(objectId);
              
              if (object) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'markerClick',
                  propertyId: object.id
                }));
              }
            });
          }
          
          // Функция для добавления объектов на карту
          function addPropertiesToMap(properties) {
            const features = [];
            
            properties.forEach(property => {
              if (property.latitude && property.longitude) {
                features.push({
                  type: 'Feature',
                  id: property.id,
                  geometry: {
                    type: 'Point',
                    coordinates: [property.latitude, property.longitude]
                  },
                  properties: {
                    balloonContent: property.title,
                    clusterCaption: property.title,
                    hintContent: property.price,
                    location: property.location,
                    price: property.price,
                    rating: property.rating,
                    type: property.type,
                    imageUrl: property.imageUrl
                  },
                  options: {
                    preset: 'islands#blueHomeIcon'
                  }
                });
              }
            });
            
            objectManager.add({
              type: 'FeatureCollection',
              features: features
            });
          }
          
          // Функция для обновления объектов на карте
          window.updateProperties = function(newProperties) {
            if (!objectManager) return false;
            
            // Очищаем все объекты
            objectManager.removeAll();
            
            // Обновляем список всех объектов
            properties = newProperties;
            
            // Применяем фильтры к новому списку объектов
            filteredProperties = filterProperties(properties, currentFilters);
            
            // Добавляем новые объекты
            addPropertiesToMap(filteredProperties);
            
            // Обновляем группировку по местоположению
            const newLocationGroups = {};
            filteredProperties.forEach(property => {
              const locationKey = property.location;
              if (!newLocationGroups[locationKey]) {
                newLocationGroups[locationKey] = [];
              }
              newLocationGroups[locationKey].push(property);
            });
            
            // Обновляем глобальную переменную
            locationGroups = newLocationGroups;
            
            return true;
          }
          
          // Функция для обновления объектов без полной перерисовки карты
          window.updatePropertiesWithoutRedraw = function(newProperties) {
            if (!objectManager) return false;
            
            try {
              // Обновляем список всех объектов
              properties = newProperties;
              
              // Применяем фильтры к новому списку объектов
              filteredProperties = filterProperties(properties, currentFilters);
              
              // Получаем текущие объекты
              const currentObjects = objectManager.objects.getAll();
              const currentIds = new Set(currentObjects.map(obj => obj.id));
              
              // Создаем множество новых ID для быстрого поиска
              const newPropertiesMap = {};
              const newIds = new Set();
              
              filteredProperties.forEach(property => {
                if (property.id && property.latitude && property.longitude) {
                  newIds.add(property.id);
                  newPropertiesMap[property.id] = property;
                }
              });
              
              // 1. Удаляем объекты, которых больше нет в новом списке
              const objectsToRemove = [];
              currentObjects.forEach(obj => {
                if (!newIds.has(obj.id)) {
                  objectsToRemove.push(obj.id);
                }
              });
              
              if (objectsToRemove.length > 0) {
                objectManager.remove(objectsToRemove);
              }
              
              // 2. Добавляем новые объекты, которых не было раньше
              const objectsToAdd = [];
              
              filteredProperties.forEach(property => {
                if (property.id && property.latitude && property.longitude && !currentIds.has(property.id)) {
                  objectsToAdd.push({
                    type: 'Feature',
                    id: property.id,
                    geometry: {
                      type: 'Point',
                      coordinates: [property.latitude, property.longitude]
                    },
                    properties: {
                      balloonContent: property.title,
                      clusterCaption: property.title,
                      hintContent: property.price,
                      location: property.location,
                      price: property.price,
                      rating: property.rating,
                      type: property.type,
                      imageUrl: property.imageUrl
                    },
                    options: {
                      preset: 'islands#blueHomeIcon'
                    }
                  });
                }
              });
              
              if (objectsToAdd.length > 0) {
                objectManager.add({
                  type: 'FeatureCollection',
                  features: objectsToAdd
                });
              }
              
              // 3. Обновляем позиции существующих объектов, если они изменились
              currentObjects.forEach(obj => {
                if (newIds.has(obj.id)) {
                  const newProperty = newPropertiesMap[obj.id];
                  
                  // Проверяем, изменились ли координаты
                  if (newProperty.latitude !== obj.geometry.coordinates[0] || 
                      newProperty.longitude !== obj.geometry.coordinates[1]) {
                    
                    // Обновляем координаты
                    objectManager.objects.setGeometry(obj.id, {
                      type: 'Point',
                      coordinates: [newProperty.latitude, newProperty.longitude]
                    });
                  }
                  
                  // Обновляем свойства, если они изменились
                  objectManager.objects.setProperties(obj.id, {
                    balloonContent: newProperty.title,
                    clusterCaption: newProperty.title,
                    hintContent: newProperty.price,
                    location: newProperty.location,
                    price: newProperty.price,
                    rating: newProperty.rating,
                    type: newProperty.type,
                    imageUrl: newProperty.imageUrl
                  });
                }
              });
              
              // Обновляем группировку по местоположению
              const newLocationGroups = {};
              filteredProperties.forEach(property => {
                const locationKey = property.location;
                if (!newLocationGroups[locationKey]) {
                  newLocationGroups[locationKey] = [];
                }
                newLocationGroups[locationKey].push(property);
              });
              
              // Обновляем глобальную переменную
              locationGroups = newLocationGroups;
              
              // Перезагружаем кластеры
              objectManager.reloadData();
              
              return true;
            } catch (e) {
              console.error('Ошибка при оптимизированном обновлении объектов:', e);
              // Если произошла ошибка, используем обычное обновление
              return window.updateProperties(newProperties);
            }
          }
          
          // Функция для применения фильтров
          window.applyFilters = function(filters) {
            currentFilters = filters;
            
            // Применяем фильтры к текущему списку объектов
            filteredProperties = filterProperties(properties, filters);
            
            // Обновляем объекты на карте
            window.updateProperties(properties);
            
            // Обновляем бейдж с количеством активных фильтров
            updateFilterBadge();
            
            return true;
          }
          
          // Функция для сброса фильтров
          window.resetFilters = function() {
            currentFilters = {
              priceMin: 0,
              priceMax: 20000,
              propertyType: 'all',
              distanceToSea: 5000,
              rating: 0,
              showOnlyWithPhotos: false
            };
            
            // Применяем фильтры к текущему списку объектов
            filteredProperties = filterProperties(properties, currentFilters);
            
            // Обновляем объекты на карте
            window.updateProperties(properties);
            
            // Обновляем бейдж с количеством активных фильтров
            updateFilterBadge();
            
            return true;
          }
          
          // Функция для фильтрации объектов
          function filterProperties(properties, filters) {
            return properties.filter(property => {
              // Фильтр по цене
              if (filters.priceMin > 0 || filters.priceMax < 20000) {
                const price = parseInt(property.price.replace(/[^0-9]/g, ''));
                if (price < filters.priceMin || price > filters.priceMax) {
                  return false;
                }
              }
              
              // Фильтр по типу жилья
              if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
                return false;
              }
              
              // Фильтр по рейтингу
              if (filters.rating > 0 && property.rating < filters.rating) {
                return false;
              }
              
              // Фильтр по расстоянию до моря
              if (filters.distanceToSea < 5000) {
                // Извлекаем расстояние из строки локации, если оно указано
                const distanceMatch = property.location.match(/(\d+)м от моря/);
                if (distanceMatch) {
                  const distance = parseInt(distanceMatch[1]);
                  if (distance > filters.distanceToSea) {
                    return false;
                  }
                }
              }
              
              // Фильтр по наличию фото
              if (filters.showOnlyWithPhotos && (!property.imageUrl || property.imageUrl === '')) {
                return false;
              }
              
              return true;
            });
          }
          
          // Функция для получения количества активных фильтров
          function getActiveFiltersCount() {
            let count = 0;
            
            if (currentFilters.priceMin > 0) count++;
            if (currentFilters.priceMax < 20000) count++;
            if (currentFilters.propertyType !== 'all') count++;
            if (currentFilters.rating > 0) count++;
            if (currentFilters.distanceToSea < 5000) count++;
            if (currentFilters.showOnlyWithPhotos) count++;
            
            return count;
          }
          
          // Функция для обновления бейджа с количеством активных фильтров
          function updateFilterBadge() {
            const filtersElement = document.querySelector('.filters');
            if (!filtersElement) return;
            
            const activeFiltersCount = getActiveFiltersCount();
            
            filtersElement.innerHTML = \`
              <div class="filter-button">
                <span class="filter-icon">⚙️</span>
                Фильтры
                \${activeFiltersCount > 0 ? \`<span class="filter-badge">\${activeFiltersCount}</span>\` : ''}
              </div>
            \`;
            
            // Добавляем обработчик клика на кнопку фильтров
            filtersElement.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'filterClick'
              }));
            });
          }
        </script>
      </body>
      </html>
    `;
  };

  // Закрытие всех всплывающих элементов
  const handleCloseAll = () => {
    setSelectedProperty(null);
    setGroupProperties(null);
  };

  // Компонент фильтров
  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.filterModalContent}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Фильтры</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.filterScrollView}>
            {/* Фильтр по цене */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Цена (₽/день)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>От {filters.priceMin}</Text>
                <Text style={styles.priceLabel}>До {filters.priceMax}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={500}
                value={filters.priceMin}
                onValueChange={(value) => handleFilterChange({ priceMin: value })}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
              />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={20000}
                step={500}
                value={filters.priceMax}
                onValueChange={(value) => handleFilterChange({ priceMax: value })}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
              />
            </View>
            
            {/* Фильтр по типу жилья */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Тип жилья</Text>
              <View style={styles.propertyTypeContainer}>
                {['all', 'apartment', 'house', 'villa', 'room'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.propertyTypeButton,
                      filters.propertyType === type && styles.propertyTypeButtonActive
                    ]}
                    onPress={() => handleFilterChange({ propertyType: type })}
                  >
                    <Text 
                      style={[
                        styles.propertyTypeText,
                        filters.propertyType === type && styles.propertyTypeTextActive
                      ]}
                    >
                      {type === 'all' ? 'Все' : 
                       type === 'apartment' ? 'Квартиры' :
                       type === 'house' ? 'Дома' :
                       type === 'villa' ? 'Виллы' : 'Комнаты'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Фильтр по расстоянию до моря */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Расстояние до моря (м)</Text>
              <Text style={styles.distanceValue}>До {filters.distanceToSea} м</Text>
              <Slider
                style={styles.slider}
                minimumValue={100}
                maximumValue={5000}
                step={100}
                value={filters.distanceToSea}
                onValueChange={(value) => handleFilterChange({ distanceToSea: value })}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor="#ddd"
              />
            </View>
            
            {/* Фильтр по рейтингу */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Минимальный рейтинг</Text>
              <View style={styles.ratingContainer}>
                {[0, 3, 3.5, 4, 4.5, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      filters.rating === rating && styles.ratingButtonActive
                    ]}
                    onPress={() => handleFilterChange({ rating })}
                  >
                    <Text 
                      style={[
                        styles.ratingButtonText,
                        filters.rating === rating && styles.ratingButtonTextActive
                      ]}
                    >
                      {rating === 0 ? 'Любой' : rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Фильтр по наличию фото */}
            <View style={styles.filterSection}>
              <View style={styles.switchContainer}>
                <Text style={styles.filterSectionTitle}>Только с фото</Text>
                <Switch
                  value={filters.showOnlyWithPhotos}
                  onValueChange={(value) => handleFilterChange({ showOnlyWithPhotos: value })}
                  trackColor={{ false: '#ddd', true: '#007AFF' }}
                  thumbColor="#fff"
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.filterActions}>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Сбросить</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Применить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка карты...</Text>
      </View>
    );
  }

  if (error) {
    return <MapPlaceholder onRetry={retryLoadMap} />;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: getMapHTML() }}
        style={[styles.map, !mapLoaded && styles.mapLoading]}
        onMessage={handleWebViewMessage}
        onError={handleWebViewError}
        onHttpError={handleWebViewError}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={[styles.loadingContainer, styles.webViewLoading]}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Загрузка карты...</Text>
          </View>
        )}
        cacheEnabled={true}
        cacheMode="LOAD_CACHE_ELSE_NETWORK"
      />

      {/* Сообщение об отказе в доступе к местоположению */}
      {locationPermissionDenied && (
        <View style={styles.permissionDeniedContainer}>
          <Text style={styles.permissionDeniedText}>
            Для определения вашего местоположения необходимо разрешение.
          </Text>
        </View>
      )}

      {/* Карточка объявления при клике на маркер */}
      {selectedProperty && (
        <PropertyCard 
          property={selectedProperty}
          onClose={handleCloseAll}
          onPress={handleNavigateToProperty}
        />
      )}

      {/* Список объявлений при клике на группу */}
      {groupProperties && (
        <PropertyGroupList 
          properties={groupProperties}
          onClose={handleCloseAll}
          onSelect={handleSelectFromGroup}
        />
      )}

      {/* Компонент фильтров */}
      <FiltersModal />
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8f8f8',
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    opacity: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionDeniedContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    padding: 10,
    borderRadius: 8,
  },
  permissionDeniedText: {
    color: 'white',
    textAlign: 'center',
  },
  propertyCardContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  propertyImage: {
    width: 100,
    height: '100%',
  },
  propertyInfo: {
    flex: 1,
    padding: 12,
  },
  propertyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  propertyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propertyDetail: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  cardButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  callButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  messageButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  messageText: {
    color: '#0066CC',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Стили для списка группы объявлений
  groupListContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: height * 0.7,
  },
  groupListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  groupList: {
    maxHeight: height * 0.5,
  },
  groupListItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  groupItemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  groupItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  groupItemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  groupItemDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  groupItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItemRatingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  saveSearchContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  saveSearchButton: {
    backgroundColor: '#0075FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveSearchText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  propertyGroupContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: height * 0.7,
  },
  propertyGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  propertyGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  propertyGroupItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  propertyGroupImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  propertyGroupInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  propertyGroupItemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  propertyGroupItemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyGroupItemRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyGroupItemRatingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  propertyGroupList: {
    maxHeight: height * 0.5,
  },
  filterModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  filterScrollView: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  slider: {
    flex: 1,
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyTypeButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  propertyTypeButtonActive: {
    borderColor: '#007AFF',
  },
  propertyTypeText: {
    fontSize: 14,
    color: '#333',
  },
  propertyTypeTextActive: {
    fontWeight: 'bold',
  },
  distanceValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
  },
  ratingButtonActive: {
    borderColor: '#007AFF',
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#333',
  },
  ratingButtonTextActive: {
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 14,
    color: '#333',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
  },
  applyButtonText: {
    fontSize: 14,
    color: 'white',
  },
});

export default PropertyMapView;