import Joi from 'joi';
export declare const validateAuth: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    socialLogin: Joi.ObjectSchema<any>;
    sendOtp: Joi.ObjectSchema<any>;
    verifyOtp: Joi.ObjectSchema<any>;
    refreshToken: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
    updatePassword: Joi.ObjectSchema<any>;
};
