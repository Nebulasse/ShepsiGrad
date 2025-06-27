import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { Property } from '../models/Property';
interface Payment {
    id: string;
    bookingId: string;
    userId: string;
    propertyId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    paymentDate?: Date;
    refundDate?: Date;
    gatewayReference?: string;
    metadata?: any;
}
interface CreatePaymentOptions {
    booking: Booking;
    user: User;
    property: Property;
    paymentMethod: string;
    returnUrl: string;
}
interface ProcessPaymentOptions {
    paymentId: string;
    gatewayReference: string;
}
interface RefundOptions {
    paymentId: string;
    amount?: number;
    reason?: string;
}
declare class PaymentService {
    createPayment(options: CreatePaymentOptions): Promise<Payment>;
    private processYookassaPayment;
    private processStripePayment;
    processSuccessfulPayment(options: ProcessPaymentOptions): Promise<Payment>;
    processFailedPayment(paymentId: string): Promise<Payment>;
    refundPayment(options: RefundOptions): Promise<Payment>;
    private refundYookassaPayment;
    private refundStripePayment;
    getPaymentById(paymentId: string): Promise<Payment | null>;
    getPaymentsByBookingId(bookingId: string): Promise<Payment[]>;
    getPaymentsByUserId(userId: string): Promise<Payment[]>;
}
declare const _default: PaymentService;
export default _default;
