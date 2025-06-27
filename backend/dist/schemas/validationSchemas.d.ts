import { z } from 'zod';
export declare const authSchema: {
    register: import("express-validator").ValidationChain[];
    login: import("express-validator").ValidationChain[];
    refreshToken: import("express-validator").ValidationChain[];
    resetPassword: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email?: string;
    }, {
        email?: string;
    }>;
    changePassword: z.ZodObject<{
        token: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password?: string;
        token?: string;
    }, {
        password?: string;
        token?: string;
    }>;
};
export declare const userSchema: {
    updateProfile: import("express-validator").ValidationChain[];
    updatePassword: z.ZodObject<{
        current_password: z.ZodString;
        new_password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        current_password?: string;
        new_password?: string;
    }, {
        current_password?: string;
        new_password?: string;
    }>;
};
export declare const propertySchema: {
    create: import("express-validator").ValidationChain[];
    update: import("express-validator").ValidationChain[];
    searchProperty: z.ZodObject<{
        city: z.ZodOptional<z.ZodString>;
        price_min: z.ZodOptional<z.ZodNumber>;
        price_max: z.ZodOptional<z.ZodNumber>;
        guests: z.ZodOptional<z.ZodNumber>;
        bedrooms: z.ZodOptional<z.ZodNumber>;
        amenities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        page: z.ZodOptional<z.ZodNumber>;
        limit: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit?: number;
        page?: number;
        city?: string;
        bedrooms?: number;
        price_min?: number;
        price_max?: number;
        guests?: number;
        amenities?: string[];
    }, {
        limit?: number;
        page?: number;
        city?: string;
        bedrooms?: number;
        price_min?: number;
        price_max?: number;
        guests?: number;
        amenities?: string[];
    }>;
};
export declare const bookingSchema: {
    create: import("express-validator").ValidationChain[];
    update: import("express-validator").ValidationChain[];
    createPayment: z.ZodObject<{
        booking_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        booking_id?: string;
    }, {
        booking_id?: string;
    }>;
    refundPayment: z.ZodObject<{
        booking_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        booking_id?: string;
    }, {
        booking_id?: string;
    }>;
};
export declare const reviewSchema: {
    createReview: import("express-validator").ValidationChain[];
    updateReview: import("express-validator").ValidationChain[];
    replyReview: import("express-validator").ValidationChain[];
    moderateReview: import("express-validator").ValidationChain[];
};
export declare const chatSchema: {
    createConversation: z.ZodObject<{
        property_id: z.ZodString;
        recipient_id: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        property_id?: string;
        recipient_id?: string;
    }, {
        message?: string;
        property_id?: string;
        recipient_id?: string;
    }>;
    sendMessage: z.ZodObject<{
        conversation_id: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message?: string;
        conversation_id?: string;
    }, {
        message?: string;
        conversation_id?: string;
    }>;
};
export declare const favoriteSchema: {
    addFavorite: z.ZodObject<{
        property_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        property_id?: string;
    }, {
        property_id?: string;
    }>;
};
export declare const notificationSchema: {
    markAsRead: z.ZodObject<{
        notification_id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        notification_id?: string;
    }, {
        notification_id?: string;
    }>;
    markAllAsRead: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
};
/**
 * Схема для валидации данных при обновлении профиля
 */
export declare const updateProfileSchema: z.ZodObject<{
    full_name: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    notifications_enabled: z.ZodOptional<z.ZodBoolean>;
    email_notifications_enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    full_name?: string;
    phone_number?: string;
    bio?: string;
    notifications_enabled?: boolean;
    email_notifications_enabled?: boolean;
}, {
    full_name?: string;
    phone_number?: string;
    bio?: string;
    notifications_enabled?: boolean;
    email_notifications_enabled?: boolean;
}>;
/**
 * Схемы валидации для запросов
 */
export declare const querySchema: {
    pagination: import("express-validator").ValidationChain[];
    sort: import("express-validator").ValidationChain[];
};
/**
 * Схемы валидации для свойств в запросах
 */
export declare const propertyQuerySchema: {
    search: import("express-validator").ValidationChain[];
};
