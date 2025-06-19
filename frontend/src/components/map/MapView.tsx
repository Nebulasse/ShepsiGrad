import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, DivIcon, LatLngExpression } from 'leaflet';
import { mapService, NearbyPropertiesResult } from '../../services/mapService';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Решение проблемы с импортом изображений
const MARKER_ICON = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const MARKER_SHADOW = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
const MARKER_ICON_RETINA = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';

// Создаем пользовательские иконки для маркеров
const defaultIcon = new Icon({
  iconUrl: MARKER_ICON,
  iconRetinaUrl: MARKER_ICON_RETINA,
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const centerIcon = new Icon({
  iconUrl: MARKER_ICON,
  iconRetinaUrl: MARKER_ICON_RETINA,
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'center-marker' // добавим класс для стилизации
});

// Создаем функцию для создания иконки с ценой
const createPriceMarkerIcon = (price: number): DivIcon => {
  return new DivIcon({
    className: 'price-marker-icon',
    html: `<div class="price-marker">
            <div class="price-tag">${(price / 1000).toFixed(0)} т.₽</div>
            <div class="price-marker-arrow"></div>
          </div>`,
    iconSize: [80, 42],
    iconAnchor: [40, 42]
  });
};

// Компонент для изменения центра карты при обновлении props
const ChangeView = ({ center, zoom }: { center: LatLngExpression, zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

// Компонент для добавления обработчика клика на карту
const MapClickHandler = ({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);
  
  return null;
};

interface MapViewProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  showNearbyProperties?: boolean;
  radius?: number;
}

const MapView: React.FC<MapViewProps> = ({
  initialLatitude = 55.7558, // Москва по умолчанию
  initialLongitude = 37.6173,
  initialZoom = 12,
  showNearbyProperties = true,
  radius = 5000
}) => {
  const [center, setCenter] = useState<[number, number]>([initialLatitude, initialLongitude]);
  const [zoom, setZoom] = useState(initialZoom);
  const [properties, setProperties] = useState<NearbyPropertiesResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialLatitude && initialLongitude) {
      setCenter([initialLatitude, initialLongitude]);
    }
  }, [initialLatitude, initialLongitude]);

  useEffect(() => {
    if (showNearbyProperties) {
      fetchNearbyProperties();
    }
  }, [center, radius, showNearbyProperties]);

  const fetchNearbyProperties = async () => {
    try {
      setIsLoading(true);
      const nearbyProperties = await mapService.findNearbyProperties(center[0], center[1], radius);
      setProperties(nearbyProperties);
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setCenter([lat, lng]);
  };

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '500px', width: '100%' }}
      >
        <ChangeView center={center} zoom={zoom} />
        <MapClickHandler onClick={handleMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Маркер текущего центра */}
        <Marker position={center} icon={centerIcon}>
          <Popup>
            Текущий центр поиска
          </Popup>
        </Marker>

        {/* Маркеры объектов недвижимости и ценники */}
        {properties.map(property => (
          <React.Fragment key={property.id}>
            {/* Маркер для ценника (будет расположен над основным маркером) */}
            <Marker 
              position={[property.latitude + 0.0008, property.longitude]}
              icon={createPriceMarkerIcon(property.priceMonthly)}
              zIndexOffset={1000}
              interactive={false}
            />
            
            {/* Основной маркер с информацией о недвижимости */}
            <Marker 
              position={[property.latitude, property.longitude]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="property-popup">
                  <div className="property-popup-image">
                    <img src={property.imageUrl} alt={property.title} />
                  </div>
                  <div className="property-popup-content">
                    <h3>{property.title}</h3>
                    <p className="property-popup-address">{property.address}</p>
                    <div className="property-popup-details">
                      <span><i className="icon-bed"></i> {property.bedrooms} комн.</span>
                      <span><i className="icon-bath"></i> {property.bathrooms} ванн.</span>
                    </div>
                    <p className="property-popup-price">
                      <span className="daily-price">{property.price} ₽/сутки</span>
                      <span className="monthly-price">{property.priceMonthly.toLocaleString()} ₽/месяц</span>
                    </p>
                    <p className="property-popup-description">{property.description.substring(0, 100)}...</p>
                    <Link to={`/properties/${property.id}`} className="property-popup-link">
                      Подробнее
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {isLoading && <div className="loading-overlay">Загрузка объектов...</div>}
    </div>
  );
};

export default MapView; 