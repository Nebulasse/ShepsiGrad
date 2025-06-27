import { User } from './User';
import { Property } from './Property';
import { Booking } from './Booking';
export declare class Review {
    id: string;
    rating: number;
    comment: string;
    reply?: string;
    replyDate?: Date;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    userId: string;
    property: Property;
    propertyId: string;
    booking?: Booking;
    bookingId?: string;
    cleanliness?: number;
    communication?: number;
    checkIn?: number;
    accuracy?: number;
    location?: number;
    value?: number;
}
