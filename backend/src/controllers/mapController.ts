import { Request, Response } from 'express';
import { MapService, GeoCoordinates } from '../services/mapService';
import { LoggerService } from '../services/loggerService';
import { PropertyModel } from '../models/Property';
import { AuthRequest } from '../middleware/auth';

export const mapController = {
    async geocodeAddress(req: Request, res: Response) {
        try {
            const { address } = req.query;
            
            if (!address || typeof address !== 'string') {
                return res.status(400).json({ error: 'Address is required' });
            }
            
            const locationDetails = await MapService.geocode(address);
            res.json(locationDetails);
        } catch (error) {
            LoggerService.error('Error geocoding address', { error, address: req.query.address });
            res.status(500).json({ error: error.message || 'Error geocoding address' });
        }
    },
    
    async reverseGeocode(req: Request, res: Response) {
        try {
            const { latitude, longitude } = req.query;
            
            if (!latitude || !longitude) {
                return res.status(400).json({ error: 'Latitude and longitude are required' });
            }
            
            const coords: GeoCoordinates = {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
            };
            
            const locationDetails = await MapService.reverseGeocode(coords);
            res.json(locationDetails);
        } catch (error) {
            LoggerService.error('Error reverse geocoding', { 
                error, 
                latitude: req.query.latitude, 
                longitude: req.query.longitude 
            });
            res.status(500).json({ error: error.message || 'Error reverse geocoding' });
        }
    },
    
    async findNearbyPlaces(req: Request, res: Response) {
        try {
            const { latitude, longitude, type, radius } = req.query;
            
            if (!latitude || !longitude || !type) {
                return res.status(400).json({ 
                    error: 'Latitude, longitude, and place type are required' 
                });
            }
            
            const coords: GeoCoordinates = {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
            };
            
            const nearbyPlaces = await MapService.findNearbyPlaces(
                coords,
                type as string,
                radius ? parseInt(radius as string) : undefined
            );
            
            res.json(nearbyPlaces);
        } catch (error) {
            LoggerService.error('Error finding nearby places', { 
                error, 
                latitude: req.query.latitude, 
                longitude: req.query.longitude,
                type: req.query.type
            });
            res.status(500).json({ error: error.message || 'Error finding nearby places' });
        }
    },
    
    async getDistance(req: Request, res: Response) {
        try {
            const { 
                origin_lat, origin_lon, origin_address,
                destination_lat, destination_lon, destination_address,
                mode
            } = req.query;
            
            let origin: GeoCoordinates | string;
            let destination: GeoCoordinates | string;
            
            if (origin_address) {
                origin = origin_address as string;
            } else if (origin_lat && origin_lon) {
                origin = {
                    latitude: parseFloat(origin_lat as string),
                    longitude: parseFloat(origin_lon as string)
                };
            } else {
                return res.status(400).json({ error: 'Origin coordinates or address required' });
            }
            
            if (destination_address) {
                destination = destination_address as string;
            } else if (destination_lat && destination_lon) {
                destination = {
                    latitude: parseFloat(destination_lat as string),
                    longitude: parseFloat(destination_lon as string)
                };
            } else {
                return res.status(400).json({ error: 'Destination coordinates or address required' });
            }
            
            const travelMode = mode as 'driving' | 'walking' | 'bicycling' | 'transit' || 'driving';
            
            const distanceResult = await MapService.getDistance(origin, destination, travelMode);
            res.json(distanceResult);
        } catch (error) {
            LoggerService.error('Error calculating distance', { error, query: req.query });
            res.status(500).json({ error: error.message || 'Error calculating distance' });
        }
    },
    
    async getPropertiesInArea(req: AuthRequest, res: Response) {
        try {
            const { latitude, longitude, radius } = req.query;
            
            if (!latitude || !longitude || !radius) {
                return res.status(400).json({ 
                    error: 'Latitude, longitude, and radius are required' 
                });
            }
            
            const center: GeoCoordinates = {
                latitude: parseFloat(latitude as string),
                longitude: parseFloat(longitude as string)
            };
            
            const radiusInKm = parseInt(radius as string) / 1000; // Переводим в километры
            
            // Для простоты используем прямоугольную область вокруг точки
            // Подробнее: http://janmatuschek.de/LatitudeLongitudeBoundingCoordinates
            const latDelta = radiusInKm / 111.32; // 1 градус широты = примерно 111.32 км
            const lonDelta = radiusInKm / (111.32 * Math.cos(center.latitude * Math.PI / 180));
            
            const bounds = {
                min_lat: center.latitude - latDelta,
                max_lat: center.latitude + latDelta,
                min_lon: center.longitude - lonDelta,
                max_lon: center.longitude + lonDelta
            };
            
            // Получаем все активные объекты в прямоугольной области
            // Этот запрос может быть медленным для большого количества объектов
            // В реальном приложении лучше использовать PostGIS или другие геопространственные базы данных
            const { data, error, count } = await PropertyModel.findAll({
                filters: {
                    status: 'active',
                    min_lat: bounds.min_lat,
                    max_lat: bounds.max_lat,
                    min_lon: bounds.min_lon,
                    max_lon: bounds.max_lon
                }
            });
            
            if (error) throw error;
            
            // Дополнительно фильтруем объекты, которые находятся в круге с заданным радиусом
            const propertiesInRadius = data.filter(property => {
                if (!property.latitude || !property.longitude) return false;
                
                const distance = calculateDistance(
                    center.latitude,
                    center.longitude,
                    property.latitude,
                    property.longitude
                );
                
                // Добавляем дистанцию к каждому объекту для фронтенда
                property.distance = distance;
                
                return distance <= parseInt(radius as string);
            });
            
            res.json({
                properties: propertiesInRadius,
                total: propertiesInRadius.length
            });
        } catch (error) {
            LoggerService.error('Error getting properties in area', { 
                error, 
                latitude: req.query.latitude, 
                longitude: req.query.longitude,
                radius: req.query.radius
            });
            res.status(500).json({ error: error.message || 'Error getting properties in area' });
        }
    }
};

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