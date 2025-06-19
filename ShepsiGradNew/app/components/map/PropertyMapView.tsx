import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator, Modal, ScrollView, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { Property } from '../../services/propertyService';
import * as Location from 'expo-location';

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

// Компонент карточки объявления
const PropertyCard = ({ property, onClose, onPress }: { property: Property, onClose: () => void, onPress: () => void }) => {
  return (
    <View style={styles.propertyCardContainer}>
      <View style={styles.propertyCard}>
        <Image source={{ uri: property.imageUrl }} style={styles.propertyImage} />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyPrice}>{property.price}</Text>
          <Text style={styles.propertyTitle}>{property.title}</Text>
          <Text style={styles.propertyAddress}>{property.location}</Text>
          <View style={styles.propertyDetails}>
            <Text style={styles.propertyDetail}>1-комн.кв • {property.area} м²</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{property.rating}</Text>
            </View>
          </View>
          <View style={styles.cardButtons}>
            <TouchableOpacity style={styles.callButton} onPress={() => {}}>
              <Ionicons name="call" size={18} color="white" />
              <Text style={styles.buttonText}>Позвонить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} onPress={onPress}>
              <Ionicons name="chatbubble" size={18} color="#0066CC" />
              <Text style={styles.messageText}>Написать</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#999" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Компонент списка группы объявлений
const PropertyGroupList = ({ properties, onClose, onSelect }: { properties: Property[], onClose: () => void, onSelect: (property: Property) => void }) => {
  return (
    <View style={styles.groupListContainer}>
      <View style={styles.groupListHeader}>
        <Text style={styles.groupListTitle}>{properties.length} объявлений в этом районе</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.groupListItem} onPress={() => onSelect(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.groupItemImage} />
            <View style={styles.groupItemInfo}>
              <Text style={styles.groupItemPrice}>{item.price}</Text>
              <Text style={styles.groupItemTitle}>{item.title}</Text>
              <Text style={styles.groupItemDetail}>1-комн • {item.area} м²</Text>
              <View style={styles.groupItemRating}>
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text style={styles.groupItemRatingText}>{item.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        style={styles.groupList}
      />
      <View style={styles.saveSearchContainer}>
        <TouchableOpacity style={styles.saveSearchButton}>
          <Text style={styles.saveSearchText}>Сохранить поиск</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  properties,
  initialRegion,
  onRegionChange
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
      }
    } catch (error) {
      console.error('Ошибка при обработке сообщения от WebView:', error);
    }
  };

  // HTML-код для карты с использованием Яндекс Карт
  const getMapHTML = () => {
    // Фильтруем объекты с координатами
    const validProperties = properties.filter(p => p.latitude && p.longitude);
    
    // Преобразуем объекты в JSON для передачи в WebView
    const propertiesJSON = JSON.stringify(validProperties);

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
            cursor: pointer;
          }
          .filter-icon {
            margin-right: 5px;
          }
        </style>
      </head>
      <body>
        <div id="map" class="map-loading"></div>
        <script>
          // Получаем данные о недвижимости
          const properties = ${propertiesJSON};
          
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
          
          function init() {
            // Создаем карту
            const map = new ymaps.Map('map', {
              center: [${currentRegion.latitude}, ${currentRegion.longitude}],
              zoom: 13,
              controls: ['zoomControl']
            }, {
              // Оптимизируем отображение карты
              yandexMapDisablePoiInteractivity: true,
              suppressMapOpenBlock: true
            });
            
            // Показываем карту
            document.getElementById('map').classList.remove('map-loading');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapLoaded'
            }));
            
            // Добавляем элемент с фильтрами
            const filtersElement = document.createElement('div');
            filtersElement.className = 'filters';
            filtersElement.innerHTML = \`
              <div class="filter-button">
                <span class="filter-icon">⚙️</span>
                Фильтры
              </div>
            \`;
            document.body.appendChild(filtersElement);
            
            // Отключаем скролл карты для улучшения UX на мобильных устройствах
            map.behaviors.disable('scrollZoom');
            
            // Создаем макет для метки цены
            const PriceLayout = ymaps.templateLayoutFactory.createClass(
              '<div style="background: #fff; border-radius: 20px; padding: 6px 12px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 1px solid #ddd; color: #333; font-size: 12px; min-width: 50px; text-align: center;">$[properties.iconContent]</div>'
            );
            
            // Создаем метки для каждой группы
            Object.entries(locationGroups).forEach(([location, props]) => {
              // Используем координаты первого объекта в группе
              const property = props[0];
              
              // Создаем иконку с ценой или количеством объектов
              const iconContent = props.length > 1 ? props.length + '+' : property.price.replace('₽/день', '');
              
              // Создаем метку
              const placemark = new ymaps.Placemark(
                [property.latitude, property.longitude],
                {
                  iconContent: iconContent,
                  // Данные для идентификации группы
                  groupLocation: location,
                  propertyId: property.id
                }, 
                {
                  // Используем кастомный макет
                  iconLayout: PriceLayout,
                  // Смещение метки
                  iconOffset: [-30, -15]
                }
              );
              
              // Обработчик клика по метке
              placemark.events.add('click', function() {
                if (props.length > 1) {
                  // Если группа, отправляем сообщение о клике на группу
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'groupClick',
                    location: location
                  }));
                } else {
                  // Если одиночный объект, отправляем его ID
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerClick',
                    propertyId: property.id
                  }));
                }
              });
              
              // Добавляем метку на карту
              map.geoObjects.add(placemark);
            });
            
            // Создаем HTML-элемент с информацией о количестве объектов
            const locationCountElement = document.createElement('div');
            locationCountElement.className = 'location-group';
            locationCountElement.innerHTML = \`
              <div class="location-count">\${properties.length} объявлений в \${Object.keys(locationGroups).length} локациях</div>
            \`;
            document.body.appendChild(locationCountElement);
            
            // Обработчик изменения положения карты
            map.events.add('boundschange', function() {
              const center = map.getCenter();
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'regionChange',
                latitude: center[0],
                longitude: center[1]
              }));
            });
            
            // Обработчик начала и окончания движения карты для предотвращения мерцания
            map.events.add('actionbegin', function() {
              document.getElementById('map').style.opacity = '1';
            });
            
            // Добавляем маркер местоположения пользователя, если доступно
            ${userLocation ? `
              const userPlacemark = new ymaps.Placemark(
                [${userLocation.latitude}, ${userLocation.longitude}],
                {},
                {
                  preset: 'islands#blueCircleDotIcon'
                }
              );
              map.geoObjects.add(userPlacemark);
            ` : ''}
          }
        </script>
      </body>
      </html>
    `;
  };

  // Обработчик ошибки загрузки WebView
  const handleWebViewError = () => {
    setError(true);
    setLoading(false);
  };

  // Повторная попытка загрузки карты
  const retryLoadMap = () => {
    setError(false);
    setLoading(true);
    // Пересоздаем WebView, обновляя ключ
    setTimeout(() => setLoading(false), 500);
  };

  // Закрытие всех всплывающих элементов
  const handleCloseAll = () => {
    setSelectedProperty(null);
    setGroupProperties(null);
  };

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
  }
});

export default PropertyMapView;