"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validationSchemas_1 = require("../schemas/validationSchemas");
const router = (0, express_1.Router)();
// Маршруты для работы с отзывами
router.post('/', auth_1.authenticate, (0, validation_1.validateRequest)(validationSchemas_1.reviewSchema.createReview), reviewController_1.reviewController.createReview);
router.get('/:id', reviewController_1.reviewController.getReviewById);
router.get('/property/:property_id', reviewController_1.reviewController.getPropertyReviews);
router.get('/user/reviews', auth_1.authenticate, reviewController_1.reviewController.getUserReviews);
router.put('/:id', auth_1.authenticate, (0, validation_1.validateRequest)(validationSchemas_1.reviewSchema.updateReview), reviewController_1.reviewController.updateReview);
router.post('/:id/reply', auth_1.authenticate, (0, auth_1.authorize)('admin', 'landlord'), (0, validation_1.validateRequest)(validationSchemas_1.reviewSchema.replyReview), reviewController_1.reviewController.addLandlordReply);
router.delete('/:id', auth_1.authenticate, reviewController_1.reviewController.deleteReview);
router.put('/:id/moderate', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, validation_1.validateRequest)(validationSchemas_1.reviewSchema.moderateReview), reviewController_1.reviewController.moderateReview);
exports.default = router;
