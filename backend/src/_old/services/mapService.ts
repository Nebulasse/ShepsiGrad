import axios from 'axios';
import { LoggerService } from './loggerService';

// Константы для API ключей
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// Интерфейсы для геоданных
export interface GeoCoordinates {
    latitude: number;
    longitude: number;
}

export interface LocationDetails {
    coordinates: GeoCoordinates;
    address: string;
    city: string;
    country: string;
    postcode?: string;
    state?: string;
    formattedAddress: string;
}

export interface NearbyPlace {
    id: string;
    name: string;
    type: string;
    coordinates: GeoCoordinates;
    address?: string;
    distance: number; // в метрах
    rating?: number;
}

export interface DistanceResult {
    distance: {
        value: number; // в метрах
        text: string;
    };
    duration: {
        value: number; // в секундах
        text: string;
    };
    origin: string;
    destination: string;
}

export class MapService {
    /**
     * Получение координат по адресу (геокодирование)
     */
    static async geocode(address: string): Promise<LocationDetails> {
        try {
            // Используем Nominatim OpenStreetMap API (бесплатно)
            const response = await axios.get(`${NOMINATIM_URL}/search`, {
                params: {
                    q: address,
                    format: 'json',
                    addressdetails: 1,
                    limit: 1
                },
                headers: {
                    'User-Agent': 'ShepsiGrad Rental App'
                }
            });

            if (!response.data || response.data.length === 0) {
                throw new Error('Address not found');
            }

            const location = response.data[0];
            const { lat, lon, address: addressDetails } = location;

            return {
                coordinates: {
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                },
                address: addressDetails.road || '',
                city: addressDetails.city || addressDetails.town || addressDetails.village || '',
                country: addressDetails.country || '',
                postcode: addressDetails.postcode,
                state: addressDetails.state,
                formattedAddress: location.display_name
            };
        } catch (error) {
            LoggerService.error('Geocoding error', { error, address });
            throw new Error(`Failed to geocode address: ${error.message}`);
        }
    }

    /**
     * Получение адреса по координатам (обратное геокодирование)
     */
    static async reverseGeocode(coords: GeoCoordinates): Promise<LocationDetails> {
        try {
            const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
                params: {
                    lat: coords.latitude,
                    lon: coords.longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'ShepsiGrad Rental App'
                }
            });

            if (!response.data) {
                throw new Error('Location not found');
            }

            const { address: addressDetails } = response.data;

            return {
                coordinates: {
                    latitude: coords.latitude,
                    longitude: coords.longitude
                },
                address: addressDetails.road || '',
                city: addressDetails.city || addressDetails.town || addressDetails.village || '',
                country: addressDetails.country || '',
                postcode: addressDetails.postcode,
                state: addressDetails.state,
                formattedAddress: response.data.display_name
            };
        } catch (error) {
            LoggerService.error('Reverse geocoding error', { error, coords });
            throw new Error(`Failed to reverse geocode: ${error.message}`);
        }
    }

    /**
     * Поиск ближайших мест определенного типа
     */
    static async findNearbyPlaces(
        coords: GeoCoordinates,
        type: string,
        radius: number = 1000
    ): Promise<NearbyPlace[]> {
        try {
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error('Google Maps API key not configured');
            }

            const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
                params: {
                    location: `${coords.latitude},${coords.longitude}`,
                    radius,
                    type,
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            if (!response.data || !response.data.results) {
                return [];
            }

            return response.data.results.map((place: any) => ({
                id: place.place_id,
                name: place.name,
                type: place.types[0],
                coordinates: {
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng
                },
                address: place.vicinity,
                distance: calculateDistance(
                    coords.latitude,
                    coords.longitude,
                    place.geometry.location.lat,
                    place.geometry.location.lng
                ),
                rating: place.rating
            }));
        } catch (error) {
            LoggerService.error('Find nearby places error', { error, coords, type });
            throw new Error(`Failed to find nearby places: ${error.message}`);
        }
    }

    /**
     * Расчет маршрута и расстояния между двумя точками
     */
    static async getDistance(
        origin: GeoCoordinates | string,
        destination: GeoCoordinates | string,
        mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
    ): Promise<DistanceResult> {
        try {
            if (!GOOGLE_MAPS_API_KEY) {
                throw new Error('Google Maps API key not configured');
            }

            // Преобразуем координаты в строки для API
            const originStr = typeof origin === 'string' 
                ? origin 
                : `${origin.latitude},${origin.longitude}`;
            
            const destinationStr = typeof destination === 'string' 
                ? destination 
                : `${destination.latitude},${destination.longitude}`;

            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: originStr,
                    destinations: destinationStr,
                    mode,
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            if (!response.data || !response.data.rows || response.data.rows.length === 0) {
                throw new Error('No route found');
            }

            const element = response.data.rows[0].elements[0];
            
            if (element.status !== 'OK') {
                throw new Error(`Route calculation failed: ${element.status}`);
            }

            return {
                distance: element.distance,
                duration: element.duration,
                origin: response.data.origin_addresses[0],
                destination: response.data.destination_addresses[0]
            };
        } catch (error) {
            LoggerService.error('Get distance error', { error, origin, destination });
            throw new Error(`Failed to calculate route: ${error.message}`);
        }
    }
}

/**
 * Вспомогательная функция для расчета расстояния между координатами (формула гаверсинуса)
 * Возвращает расстояние в метрах
 */
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371000; // Радиус Земли в метрах
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
} 