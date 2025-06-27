"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imageController_1 = require("../controllers/imageController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Маршруты требуют аутентификации
router.use(auth_1.authenticate);
// Загрузка изображения
router.post('/upload', imageController_1.uploadMiddleware, imageController_1.imageController.uploadImage);
// Удаление изображения
router.delete('/:fileId', imageController_1.imageController.deleteImage);
exports.default = router;
