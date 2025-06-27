"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapController = void 0;
const mapService_1 = require("../services/mapService");
const loggerService_1 = require("../services/loggerService");
const Property_1 = require("../models/Property");
exports.mapController = {
    async geocodeAddress(req, res) {
        try {
            const { address } = req.query;
            if (!address || typeof address !== 'string') {
                return res.status(400).json({ error: 'Address is required' });
            }
            const locationDetails = await mapService_1.MapService.geocode(address);
            res.json(locationDetails);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error geocoding address', { error, address: req.query.address });
            res.status(500).json({ error: error.message || 'Error geocoding address' });
        }
    },
    async reverseGeocode(req, res) {
        try {
            const { latitude, longitude } = req.query;
            if (!latitude || !longitude) {
                return res.status(400).json({ error: 'Latitude and longitude are required' });
            }
            const coords = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };
            const locationDetails = await mapService_1.MapService.reverseGeocode(coords);
            res.json(locationDetails);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error reverse geocoding', {
                error,
                latitude: req.query.latitude,
                longitude: req.query.longitude
            });
            res.status(500).json({ error: error.message || 'Error reverse geocoding' });
        }
    },
    async findNearbyPlaces(req, res) {
        try {
            const { latitude, longitude, type, radius } = req.query;
            if (!latitude || !longitude || !type) {
                return res.status(400).json({
                    error: 'Latitude, longitude, and place type are required'
                });
            }
            const coords = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };
            const nearbyPlaces = await mapService_1.MapService.findNearbyPlaces(coords, type, radius ? parseInt(radius) : undefined);
            res.json(nearbyPlaces);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error finding nearby places', {
                error,
                latitude: req.query.latitude,
                longitude: req.query.longitude,
                type: req.query.type
            });
            res.status(500).json({ error: error.message || 'Error finding nearby places' });
        }
    },
    async getDistance(req, res) {
        try {
            const { origin_lat, origin_lon, origin_address, destination_lat, destination_lon, destination_address, mode } = req.query;
            let origin;
            let destination;
            if (origin_address) {
                origin = origin_address;
            }
            else if (origin_lat && origin_lon) {
                origin = {
                    latitude: parseFloat(origin_lat),
                    longitude: parseFloat(origin_lon)
                };
            }
            else {
                return res.status(400).json({ error: 'Origin coordinates or address required' });
            }
            if (destination_address) {
                destination = destination_address;
            }
            else if (destination_lat && destination_lon) {
                destination = {
                    latitude: parseFloat(destination_lat),
                    longitude: parseFloat(destination_lon)
                };
            }
            else {
                return res.status(400).json({ error: 'Destination coordinates or address required' });
            }
            const travelMode = mode || 'driving';
            const distanceResult = await mapService_1.MapService.getDistance(origin, destination, travelMode);
            res.json(distanceResult);
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error calculating distance', { error, query: req.query });
            res.status(500).json({ error: error.message || 'Error calculating distance' });
        }
    },
    async getPropertiesInArea(req, res) {
        try {
            const { latitude, longitude, radius } = req.query;
            if (!latitude || !longitude || !radius) {
                return res.status(400).json({
                    error: 'Latitude, longitude, and radius are required'
                });
            }
            const center = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude)
            };
            const radiusInKm = parseInt(radius) / 1000; // Переводим в километры
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
            const { data, error, count } = await Property_1.PropertyModel.findAll({
                filters: {
                    status: 'active',
                    min_lat: bounds.min_lat,
                    max_lat: bounds.max_lat,
                    min_lon: bounds.min_lon,
                    max_lon: bounds.max_lon
                }
            });
            if (error)
                throw error;
            // Дополнительно фильтруем объекты, которые находятся в круге с заданным радиусом
            const propertiesInRadius = data.filter(property => {
                if (!property.latitude || !property.longitude)
                    return false;
                const distance = calculateDistance(center.latitude, center.longitude, property.latitude, property.longitude);
                // Добавляем дистанцию к каждому объекту для фронтенда
                property.distance = distance;
                return distance <= parseInt(radius);
            });
            res.json({
                properties: propertiesInRadius,
                total: propertiesInRadius.length
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting properties in area', {
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
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Радиус Земли в метрах
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(degrees) {
    return degrees * (Math.PI / 180);
}
