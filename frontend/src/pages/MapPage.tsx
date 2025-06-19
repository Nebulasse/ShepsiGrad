import React, { useState, useEffect } from 'react';
import MapView from '../components/map/MapView';
import { mapService, NearbyPropertiesResult } from '../services/mapService';
import './MapPage.css';

const MapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // Радиус поиска в метрах
  const [properties, setProperties] = useState<NearbyPropertiesResult[]>([]);

  // При первом рендере используем Москву как центр по умолчанию
  useEffect(() => {
    if (!searchLocation) {
      setSearchLocation({ lat: 55.7558, lng: 37.6173 }); // Москва
    }
  }, []);

  // Обновляем список объектов при изменении местоположения или радиуса
  useEffect(() => {
    if (searchLocation) {
      fetchNearbyProperties();
    }
  }, [searchLocation, radius]);

  const fetchNearbyProperties = async () => {
    if (!searchLocation) return;
    
    try {
      setIsLoading(true);
      const nearbyProperties = await mapService.findNearbyProperties(
        searchLocation.lat,
        searchLocation.lng,
        radius
      );
      setProperties(nearbyProperties);
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      setError('Ошибка при получении данных о недвижимости.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Введите адрес для поиска');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await mapService.geocodeAddress(searchQuery);
      setSearchLocation({ lat: result.latitude, lng: result.longitude });
    } catch (err) {
      console.error('Error during search:', err);
      setError('Не удалось найти указанный адрес. Пожалуйста, уточните запрос.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRadiusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRadius(parseInt(event.target.value));
  };

  return (
    <div className="map-page">
      <div className="map-page-header">
        <h1>Поиск недвижимости на карте</h1>
        <p className="map-page-description">
          Найдите идеальное жилье для аренды, просмотрев доступные варианты на карте.
          Указывайте нужный район или адрес, чтобы найти недвижимость в конкретном месте.
        </p>
      </div>

      <div className="map-search-container">
        <div className="map-search-box">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Введите адрес или район"
            className="map-search-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="map-search-button">
            Найти
          </button>
        </div>

        <div className="map-radius-selector">
          <label htmlFor="radius-select">Радиус поиска:</label>
          <select
            id="radius-select"
            value={radius}
            onChange={handleRadiusChange}
            className="radius-select"
          >
            <option value="1000">1 км</option>
            <option value="2000">2 км</option>
            <option value="3000">3 км</option>
            <option value="5000">5 км</option>
            <option value="10000">10 км</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="map-error-message">
          {error}
        </div>
      )}

      <div className="map-content">
        <div className="map-view-container">
          {searchLocation && (
            <MapView
              initialLatitude={searchLocation.lat}
              initialLongitude={searchLocation.lng}
              showNearbyProperties={true}
              radius={radius}
            />
          )}
          
          <div className="map-instructions">
            <p>
              <i className="map-info-icon">ℹ️</i>
              Нажмите на маркер, чтобы увидеть подробную информацию об объекте.
              Ценники над маркерами показывают ежемесячную стоимость аренды.
            </p>
          </div>
        </div>

        <div className="property-list-sidebar">
          <h3>Объекты на карте ({properties.length})</h3>
          {isLoading ? (
            <div className="loading-message">Загрузка объектов...</div>
          ) : properties.length > 0 ? (
            <div className="property-list">
              {properties.map((property) => (
                <div key={property.id} className="property-list-item">
                  <div className="property-list-image">
                    <img src={property.imageUrl} alt={property.title} />
                  </div>
                  <div className="property-list-details">
                    <h4>{property.title}</h4>
                    <p className="property-list-address">{property.address}</p>
                    <div className="property-list-features">
                      <span>{property.bedrooms} комн.</span> • 
                      <span>{property.bathrooms} ванн.</span>
                    </div>
                    <div className="property-list-price">
                      <div className="monthly-price">{property.priceMonthly.toLocaleString()} ₽/месяц</div>
                      <div className="daily-price">{property.price} ₽/сутки</div>
                    </div>
                    <a href={`/properties/${property.id}`} className="view-property-link">
                      Подробнее
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-properties-message">
              Объекты недвижимости в указанном радиусе не найдены. 
              Попробуйте увеличить радиус поиска или изменить местоположение.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapPage; 