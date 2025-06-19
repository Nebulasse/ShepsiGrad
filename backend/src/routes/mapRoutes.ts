import { Router } from 'express';
import { mapController } from '../controllers/mapController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Публичные маршруты
router.get('/geocode', mapController.geocodeAddress);
router.get('/reverse-geocode', mapController.reverseGeocode);
router.get('/distance', mapController.getDistance);

// Маршруты, требующие аутентификации
router.get('/nearby', authenticate, mapController.findNearbyPlaces);
router.get('/properties-in-area', authenticate, mapController.getPropertiesInArea);

export default router; 