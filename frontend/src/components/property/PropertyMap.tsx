import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyMap.css';

// Решение проблемы с импортом изображений
const MARKER_ICON = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const MARKER_SHADOW = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
const MARKER_ICON_RETINA = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';

// Создаем пользовательскую иконку для маркера
const propertyIcon = new Icon({
  iconUrl: MARKER_ICON,
  iconRetinaUrl: MARKER_ICON_RETINA,
  shadowUrl: MARKER_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  zoom?: number;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  latitude, 
  longitude, 
  title, 
  zoom = 15 
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="property-map">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '300px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={propertyIcon}>
          <Popup>
            {title}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default PropertyMap;
