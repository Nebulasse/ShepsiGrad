import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest, validateQuery } from '../middleware/validation';
import { bookingSchema, bookingQuerySchema } from '../schemas/validationSchemas';

const router = Router();

// Защищенные маршруты
router.post('/', authenticate, validateRequest(bookingSchema), bookingController.createBooking);
router.get('/:id', authenticate, bookingController.getBookingById);
router.get('/user/bookings', authenticate, validateQuery(bookingQuerySchema), bookingController.getUserBookings);
router.get('/property/:propertyId/bookings', authenticate, authorize('admin', 'landlord'), validateQuery(bookingQuerySchema), bookingController.getPropertyBookings);
router.put('/:id/status', authenticate, authorize('admin', 'landlord'), validateRequest(bookingSchema), bookingController.updateBookingStatus);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Маршрут для проверки доступности объекта
router.get('/property/:property_id/availability', bookingController.checkPropertyAvailability);

// Маршруты для платежей
router.post('/payment/create', authenticate, bookingController.createPayment);
router.post('/payment/stripe/create', authenticate, bookingController.createStripePayment);
router.get('/payment/status/:id', authenticate, bookingController.checkPaymentStatus);
router.post('/payment/refund', authenticate, bookingController.refundPayment);

export default router; 