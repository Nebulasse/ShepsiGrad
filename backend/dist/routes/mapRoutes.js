"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mapController_1 = require("../controllers/mapController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Публичные маршруты
router.get('/geocode', mapController_1.mapController.geocodeAddress);
router.get('/reverse-geocode', mapController_1.mapController.reverseGeocode);
router.get('/distance', mapController_1.mapController.getDistance);
// Маршруты, требующие аутентификации
router.get('/nearby', auth_1.authenticate, mapController_1.mapController.findNearbyPlaces);
router.get('/properties-in-area', auth_1.authenticate, mapController_1.mapController.getPropertiesInArea);
exports.default = router;
