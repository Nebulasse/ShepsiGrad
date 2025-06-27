"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAuth = exports.validateQuery = exports.validateRequest = exports.validateBookingData = exports.validatePropertyData = exports.validateUserData = exports.validateRequired = exports.validatePrice = exports.validateDate = exports.validatePhoneNumber = exports.validatePassword = exports.validateEmail = exports.ValidationError = void 0;
const zod_1 = require("zod");
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    // Минимум 8 символов, минимум 1 буква и 1 цифра
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{10,14}$/;
    return phoneRegex.test(phone);
};
exports.validatePhoneNumber = validatePhoneNumber;
const validateDate = (date) => {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};
exports.validateDate = validateDate;
const validatePrice = (price) => {
    return price > 0 && price <= 1000000;
};
exports.validatePrice = validatePrice;
const validateRequired = (value) => {
    return value !== undefined && value !== null && value !== '';
};
exports.validateRequired = validateRequired;
const validateUserData = (data) => {
    const errors = [];
    if (!(0, exports.validateRequired)(data.email)) {
        errors.push('Email is required');
    }
    else if (!(0, exports.validateEmail)(data.email)) {
        errors.push('Invalid email format');
    }
    if (!(0, exports.validateRequired)(data.full_name)) {
        errors.push('Full name is required');
    }
    if (data.phone_number && !(0, exports.validatePhoneNumber)(data.phone_number)) {
        errors.push('Invalid phone number format');
    }
    if (data.role && !['user', 'admin', 'landlord'].includes(data.role)) {
        errors.push('Invalid role');
    }
    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};
exports.validateUserData = validateUserData;
const validatePropertyData = (data) => {
    const errors = [];
    if (!(0, exports.validateRequired)(data.title)) {
        errors.push('Title is required');
    }
    if (!(0, exports.validateRequired)(data.description)) {
        errors.push('Description is required');
    }
    if (!(0, exports.validateRequired)(data.address)) {
        errors.push('Address is required');
    }
    if (!(0, exports.validateRequired)(data.city)) {
        errors.push('City is required');
    }
    if (!(0, exports.validateRequired)(data.price_per_day)) {
        errors.push('Price per day is required');
    }
    else if (!(0, exports.validatePrice)(data.price_per_day)) {
        errors.push('Invalid price');
    }
    if (!(0, exports.validateRequired)(data.property_type)) {
        errors.push('Property type is required');
    }
    if (!(0, exports.validateRequired)(data.bedrooms)) {
        errors.push('Number of bedrooms is required');
    }
    else if (data.bedrooms < 1) {
        errors.push('Invalid number of bedrooms');
    }
    if (!(0, exports.validateRequired)(data.bathrooms)) {
        errors.push('Number of bathrooms is required');
    }
    else if (data.bathrooms < 1) {
        errors.push('Invalid number of bathrooms');
    }
    if (!(0, exports.validateRequired)(data.max_guests)) {
        errors.push('Maximum number of guests is required');
    }
    else if (data.max_guests < 1) {
        errors.push('Invalid maximum number of guests');
    }
    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};
exports.validatePropertyData = validatePropertyData;
const validateBookingData = (data) => {
    const errors = [];
    if (!(0, exports.validateRequired)(data.property_id)) {
        errors.push('Property ID is required');
    }
    if (!(0, exports.validateRequired)(data.check_in_date)) {
        errors.push('Check-in date is required');
    }
    else if (!(0, exports.validateDate)(data.check_in_date)) {
        errors.push('Invalid check-in date');
    }
    if (!(0, exports.validateRequired)(data.check_out_date)) {
        errors.push('Check-out date is required');
    }
    else if (!(0, exports.validateDate)(data.check_out_date)) {
        errors.push('Invalid check-out date');
    }
    if (new Date(data.check_in_date) >= new Date(data.check_out_date)) {
        errors.push('Check-out date must be after check-in date');
    }
    if (!(0, exports.validateRequired)(data.total_price)) {
        errors.push('Total price is required');
    }
    else if (!(0, exports.validatePrice)(data.total_price)) {
        errors.push('Invalid total price');
    }
    if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
    }
};
exports.validateBookingData = validateBookingData;
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: error.errors
                });
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync(req.query);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: 'Validation error',
                    details: error.errors
                });
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateQuery = validateQuery;
exports.validateAuth = {
    register: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
        full_name: zod_1.z.string().min(2, 'Full name must be at least 2 characters'),
        phone_number: zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    }),
    login: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required')
    }),
    phone: zod_1.z.object({
        phone: zod_1.z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Invalid phone number format')
    }),
    verifyOtp: zod_1.z.object({
        phone: zod_1.z.string().regex(/^\+?[1-9]\d{10,14}$/, 'Invalid phone number format'),
        otp: zod_1.z.string().min(4, 'OTP must be at least 4 characters')
    }),
    social: zod_1.z.object({
        redirectUrl: zod_1.z.string().url('Invalid redirect URL')
    }),
    resetPassword: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format')
    }),
    updatePassword: zod_1.z.object({
        newPassword: zod_1.z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
            .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
            .regex(/[0-9]/, 'Password must contain at least one number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    })
};
