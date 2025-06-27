import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';

export const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map((err: any) => err.message);
                throw new ValidationError(errors.join(', '));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateQuery = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = schema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map((err: any) => err.message);
                throw new ValidationError(errors.join(', '));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

export const validateParams = (schema: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = schema.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            });

            if (error) {
                const errors = error.details.map((err: any) => err.message);
                throw new ValidationError(errors.join(', '));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}; 