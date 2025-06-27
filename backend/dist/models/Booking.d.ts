import { User } from './User';
import { Property } from './Property';
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed",
    REJECTED = "rejected"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Booking {
    id: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId?: string;
    paymentMethodId?: string;
    transactionId?: string;
    cancellationReason?: string;
    isRefundRequested: boolean;
    guestsCount: number;
    specialRequests?: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    property: Property;
    propertyId: string;
    serviceFee: number;
    cleaningFee: number;
    taxAmount: number;
    get nightsCount(): number;
}
