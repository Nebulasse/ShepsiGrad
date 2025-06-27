import { BookingStatus, PaymentStatus } from '../../models/Booking';
import { UserRole } from '../../models/User';
/**
 * Тип для мока модели бронирования
 */
export interface MockBooking {
    id: string;
    propertyId: string;
    userId: string;
    checkInDate: Date;
    checkOutDate: Date;
    guestsCount: number;
    totalPrice: number;
    status: BookingStatus;
    paymentStatus?: PaymentStatus;
    createdAt: Date;
    updatedAt?: Date;
    save?: jest.Mock;
    toJSON?: () => any;
}
/**
 * Тип для мока модели пользователя
 */
export interface MockUser {
    id: string;
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: UserRole;
    profileImage?: string;
    emailVerified: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
    save?: jest.Mock;
    toJSON?: () => any;
}
/**
 * Тип для мока модели объекта недвижимости
 */
export interface MockProperty {
    id: string;
    title: string;
    description?: string;
    address: string;
    city?: string;
    country?: string;
    price: number;
    ownerId: string;
    images?: string[];
    amenities?: string[];
    type?: string;
    status?: string;
    createdAt: Date;
    updatedAt?: Date;
    save?: jest.Mock;
    toJSON?: () => any;
}
/**
 * Тип для мока модели отзыва
 */
export interface MockReview {
    id: string;
    userId: string;
    propertyId: string;
    rating: number;
    comment: string;
    images?: string[];
    isApproved: boolean;
    isHidden: boolean;
    adminComment?: string;
    ownerReply?: string;
    ownerReplyDate?: Date;
    cleanliness?: number;
    communication?: number;
    checkIn?: number;
    accuracy?: number;
    location?: number;
    value?: number;
    createdAt: Date;
    updatedAt?: Date;
    save?: jest.Mock;
    toJSON?: () => any;
}
/**
 * Тип для мока модели платежа
 */
export interface MockPayment {
    id: string;
    bookingId: string;
    userId: string;
    propertyId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    paymentDate?: Date;
    refundDate?: Date;
    gatewayReference?: string;
    metadata?: any;
    save?: jest.Mock;
    toJSON?: () => any;
}
