import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    // Минимум 8 символов, минимум 1 буква и 1 цифра
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{10,14}$/;
    return phoneRegex.test(phone);
};

export const validateDate = (date: string): boolean => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const validatePrice = (price: number): boolean => {
    return price > 0 && price <= 1000000;
};

export const validateRequired = (value: any): boolean => {
    return value !== undefined && value !== null && value !== '';
};

export const validateUserData = (data: any) => {
    const errors: string[] = [];

    if (!validateRequired(data.email)) {
        errors.push('Email is required');
    } else if (!validateEmail(data.email)) {
        errors.push('Invalid email format');
    }

    if (!validateRequired(data.full_name)) {
        errors.push('Full name is required');
    }

    if (data.phone_number && !validatePhoneNumber(data.phone_number)) {
        errors.push('Invalid phone number format');
    }

    if (data.role && !['user', 'admin', 'landlord'].includes(data.role)) {
        errors.push('Invalid role');
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};

export const validatePropertyData = (data: any) => {
    const errors: string[] = [];

    if (!validateRequired(data.title)) {
        errors.push('Title is required');
    }

    if (!validateRequired(data.description)) {
        errors.push('Description is required');
    }

    if (!validateRequired(data.address)) {
        errors.push('Address is required');
    }

    if (!validateRequired(data.city)) {
        errors.push('City is required');
    }

    if (!validateRequired(data.price_per_day)) {
        errors.push('Price per day is required');
    } else if (!validatePrice(data.price_per_day)) {
        errors.push('Invalid price');
    }

    if (!validateRequired(data.property_type)) {
        errors.push('Property type is required');
    }

    if (!validateRequired(data.bedrooms)) {
        errors.push('Number of bedrooms is required');
    } else if (data.bedrooms < 1) {
        errors.push('Invalid number of bedrooms');
    }

    if (!validateRequired(data.bathrooms)) {
        errors.push('Number of bathrooms is required');
    } else if (data.bathrooms < 1) {
        errors.push('Invalid number of bathrooms');
    }

    if (!validateRequired(data.max_guests)) {
        errors.push('Maximum number of guests is required');
    } else if (data.max_guests < 1) {
        errors.push('Invalid maximum number of guests');
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};

export const validateBookingData = (data: any) => {
    const errors: string[] = [];

    if (!validateRequired(data.property_id)) {
        errors.push('Property ID is required');
    }

    if (!validateRequired(data.check_in_date)) {
        errors.push('Check-in date is required');
    } else if (!validateDate(data.check_in_date)) {
        errors.push('Invalid check-in date');
    }

    if (!validateRequired(data.check_out_date)) {
        errors.push('Check-out date is required');
    } else if (!validateDate(data.check_out_date)) {
        errors.push('Invalid check-out date');
    }

    if (new Date(data.check_in_date) >= new Date(data.check_out_date)) {
        errors.push('Check-out date must be after check-in date');
    }

    if (!validateRequired(data.total_price)) {
        errors.push('Total price is required');
    } else if (!validatePrice(data.total_price)) {
        errors.push('Invalid total price');
    }

    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};

export const validateRequest = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: error.errors
                });
            } else {
                next(error);
            }
        }
    };
};

export const validateQuery = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync(req.query);
            next();
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: error.errors
                });
            } else {
                next(error);
            }
        }
    };
};

export const validateAuth = {
    register: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        full_name: z.string().min(2, 'Full name must be at least 2 characters'),
        phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    }),

    login: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required')
    }),

    phone: z.object({
        phone: z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Invalid phone number format')
    }),

    verifyOtp: z.object({
        phone: z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Invalid phone number format'),
        otp: z.string().min(4, 'OTP must be at least 4 characters')
    }),

    social: z.object({
        redirectUrl: z.string().url('Invalid redirect URL')
    }),

    resetPassword: z.object({
        email: z.string().email('Invalid email format')
    }),

    updatePassword: z.object({
        newPassword: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    })
}; 