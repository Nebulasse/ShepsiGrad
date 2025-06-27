"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParams = exports.validateQuery = exports.validateRequest = void 0;
const validation_1 = require("../utils/validation");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body, {
                abortEarly: false,
                stripUnknown: true
            });
            if (error) {
                const errors = error.details.map((err) => err.message);
                throw new validation_1.ValidationError(errors.join(', '));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.query, {
                abortEarly: false,
                stripUnknown: true
            });
            if (error) {
                const errors = error.details.map((err) => err.message);
                throw new validation_1.ValidationError(errors.join(', '));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.params, {
                abortEarly: false,
                stripUnknown: true
            });
            if (error) {
                const errors = error.details.map((err) => err.message);
                throw new validation_1.ValidationError(errors.join(', '));
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
