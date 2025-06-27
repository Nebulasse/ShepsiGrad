import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
export declare class ValidationError extends Error {
    constructor(message: string);
}
export declare const validateEmail: (email: string) => boolean;
export declare const validatePassword: (password: string) => boolean;
export declare const validatePhoneNumber: (phone: string) => boolean;
export declare const validateDate: (date: string) => boolean;
export declare const validatePrice: (price: number) => boolean;
export declare const validateRequired: (value: any) => boolean;
export declare const validateUserData: (data: any) => void;
export declare const validatePropertyData: (data: any) => void;
export declare const validateBookingData: (data: any) => void;
export declare const validateRequest: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateQuery: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateAuth: {
    register: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        full_name: z.ZodString;
        phone_number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password?: string;
        email?: string;
        full_name?: string;
        phone_number?: string;
    }, {
        password?: string;
        email?: string;
        full_name?: string;
        phone_number?: string;
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        password?: string;
        email?: string;
    }, {
        password?: string;
        email?: string;
    }>;
    phone: z.ZodObject<{
        phone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phone?: string;
    }, {
        phone?: string;
    }>;
    verifyOtp: z.ZodObject<{
        phone: z.ZodString;
        otp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phone?: string;
        otp?: string;
    }, {
        phone?: string;
        otp?: string;
    }>;
    social: z.ZodObject<{
        redirectUrl: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        redirectUrl?: string;
    }, {
        redirectUrl?: string;
    }>;
    resetPassword: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email?: string;
    }, {
        email?: string;
    }>;
    updatePassword: z.ZodObject<{
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        newPassword?: string;
    }, {
        newPassword?: string;
    }>;
};
