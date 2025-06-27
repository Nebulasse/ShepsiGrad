"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const propertyController_1 = require("../controllers/propertyController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = (0, express_1.Router)();
// Публичные маршруты
router.get('/', (0, validation_1.validateQuery)(validationSchemas_1.propertyQuerySchema), propertyController_1.propertyController.getProperties);
router.get('/:id', propertyController_1.propertyController.getPropertyById);
// Защищенные маршруты
// Основные операции с недвижимостью
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), (0, validation_1.validateRequest)(validationSchemas_1.propertySchema), propertyController_1.propertyController.createProperty);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), (0, validation_1.validateRequest)(validationSchemas_1.propertySchema), propertyController_1.propertyController.updateProperty);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), propertyController_1.propertyController.deleteProperty);
router.get('/user/properties', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), (0, validation_1.validateQuery)(validationSchemas_1.propertyQuerySchema), propertyController_1.propertyController.getUserProperties);
// Маршруты для работы с изображениями
router.post('/:id/images', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), propertyController_1.propertyController.addPropertyImages);
router.delete('/:id/images/:imageId', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), propertyController_1.propertyController.deletePropertyImage);
router.put('/:id/images/:imageId/primary', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), propertyController_1.propertyController.setPrimaryImage);
exports.default = router;
