"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const User_1 = require("../models/User");
const validation_1 = require("../utils/validation");
const loggerService_1 = require("../services/loggerService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
exports.authController = {
    async register(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, password, firstName, lastName } = req.body;
            const existingUser = await User_1.UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            const user = await User_1.UserModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'user',
                is_blocked: false,
                block_reason: null,
                block_until: null
            });
            const token = (0, auth_1.generateToken)(user.id);
            loggerService_1.LoggerService.info('New user registered', { userId: user.id });
            res.status(201).json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        }
        catch (error) {
            if (error instanceof validation_1.ValidationError) {
                res.status(400).json({ error: error.message });
            }
            else {
                loggerService_1.LoggerService.error('Error registering user', { error });
                res.status(500).json({ error: 'Ошибка при регистрации' });
            }
        }
    },
    async login(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const { email, password } = req.body;
            const user = await User_1.UserModel.findByEmail(email);
            if (!user || !user.password) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }
            if (user.is_blocked) {
                if (user.block_until && new Date(user.block_until) < new Date()) {
                    await User_1.UserModel.update(user.id, {
                        is_blocked: false,
                        block_reason: null,
                        block_until: null
                    });
                }
                else {
                    return res.status(403).json({
                        error: 'Account is blocked',
                        reason: user.block_reason,
                        until: user.block_until
                    });
                }
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                loggerService_1.LoggerService.warn('Failed login attempt', { email });
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }
            const token = (0, auth_1.generateToken)(user.id);
            loggerService_1.LoggerService.info('User logged in', { userId: user.id });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error logging in', { error });
            res.status(500).json({ error: 'Ошибка при входе' });
        }
    },
    async socialLogin(req, res) {
        try {
            const { id, email, provider } = req.body;
            if (!id || !email) {
                return res.status(400).json({ error: 'User ID and email are required' });
            }
            let user = await User_1.UserModel.findByEmail(email);
            if (!user) {
                user = await User_1.UserModel.create({
                    id,
                    email,
                    full_name: req.body.full_name || email.split('@')[0],
                    phone_number: req.body.phone_number || null,
                    role: 'user',
                    is_blocked: false,
                    block_reason: null,
                    block_until: null,
                    auth_provider: provider
                });
                loggerService_1.LoggerService.info('New user registered via social auth', { userId: user.id, provider });
            }
            else if (user.is_blocked) {
                if (user.block_until && new Date(user.block_until) < new Date()) {
                    await User_1.UserModel.update(user.id, {
                        is_blocked: false,
                        block_reason: null,
                        block_until: null
                    });
                }
                else {
                    return res.status(403).json({
                        error: 'Account is blocked',
                        reason: user.block_reason,
                        until: user.block_until
                    });
                }
            }
            const token = (0, auth_1.generateToken)(user.id);
            loggerService_1.LoggerService.info('User logged in via social auth', { userId: user.id, provider });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error in social login', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async sendPhoneOtp(req, res) {
        try {
            const { phone } = req.body;
            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }
            await authService_1.AuthService.sendPhoneOtp(phone);
            res.json({ message: 'OTP sent successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error sending OTP', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async verifyPhoneOtp(req, res) {
        try {
            const { phone, otp } = req.body;
            if (!phone || !otp) {
                return res.status(400).json({ error: 'Phone number and OTP are required' });
            }
            const { user, session } = await authService_1.AuthService.loginWithPhone(phone, otp);
            const token = (0, auth_1.generateToken)(user.id);
            loggerService_1.LoggerService.info('User logged in with phone', { userId: user.id });
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone_number: user.phone_number,
                    role: user.role
                }
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error verifying OTP', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async logout(req, res) {
        var _a;
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            loggerService_1.LoggerService.info('User logged out', { userId: req.user.id });
            res.json({ message: 'Logged out successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error logging out', { error, userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async resetPassword(req, res) {
        try {
            const { email } = req.body;
            await authService_1.AuthService.resetPassword(email);
            res.json({ message: 'Password reset instructions sent to your email' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error resetting password', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async updatePassword(req, res) {
        var _a;
        try {
            const { newPassword } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            await authService_1.AuthService.updatePassword(userId, newPassword);
            res.json({ message: 'Password updated successfully' });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error updating password', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const user = await User_1.UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                phone_number: user.phone_number,
                role: user.role
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error getting current user', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async refreshToken(req, res) {
        try {
            const { refresh_token } = req.body;
            const { data, error } = await authService_1.AuthService.refreshSession(refresh_token);
            if (error) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }
            const user = await User_1.UserModel.findById(data.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const token = (0, auth_1.generateToken)(user.id);
            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                },
                refresh_token: data.session.refresh_token
            });
        }
        catch (error) {
            loggerService_1.LoggerService.error('Error refreshing token', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    async getProfile(req, res) {
        try {
            const user = await User_1.UserModel.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        }
        catch (error) {
            res.status(500).json({ error: 'Ошибка при получении профиля' });
        }
    }
};
