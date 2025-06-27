"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const favoriteController_1 = __importDefault(require("../controllers/favoriteController"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Маршруты для работы с избранным
router.post('/', auth_middleware_1.authenticate, favoriteController_1.default.addToFavorites);
router.get('/', auth_middleware_1.authenticate, favoriteController_1.default.getUserFavorites);
router.get('/:propertyId/check', auth_middleware_1.authenticate, favoriteController_1.default.checkIsFavorite);
router.delete('/:propertyId', auth_middleware_1.authenticate, favoriteController_1.default.removeFromFavorites);
exports.default = router;
