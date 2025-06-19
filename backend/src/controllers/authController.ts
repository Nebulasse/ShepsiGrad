import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { UserModel } from '../models/User';
import { ValidationError } from '../utils/validation';
import { LoggerService } from '../services/loggerService';
import bcrypt from 'bcrypt';
import { JWT_SECRET as jwtSecret, JWT_EXPIRES_IN } from '../config/appConfig';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { validationResult } from 'express-validator';

export const authController = {
    async register(req: AuthRequest, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, firstName, lastName } = req.body;

            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await UserModel.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: 'user',
                is_blocked: false,
                block_reason: null,
                block_until: null
            });

            const token = generateToken(user.id);

            LoggerService.info('New user registered', { userId: user.id });

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
        } catch (error) {
            if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                LoggerService.error('Error registering user', { error });
                res.status(500).json({ error: 'Ошибка при регистрации' });
            }
        }
    },

    async login(req: AuthRequest, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            const user = await UserModel.findByEmail(email);
            if (!user || !user.password) {
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            if (user.is_blocked) {
                if (user.block_until && new Date(user.block_until) < new Date()) {
                    await UserModel.update(user.id, {
                        is_blocked: false,
                        block_reason: null,
                        block_until: null
                    });
                } else {
                    return res.status(403).json({
                        error: 'Account is blocked',
                        reason: user.block_reason,
                        until: user.block_until
                    });
                }
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                LoggerService.warn('Failed login attempt', { email });
                return res.status(401).json({ error: 'Неверный email или пароль' });
            }

            const token = generateToken(user.id);

            LoggerService.info('User logged in', { userId: user.id });

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
        } catch (error) {
            LoggerService.error('Error logging in', { error });
            res.status(500).json({ error: 'Ошибка при входе' });
        }
    },

    async socialLogin(req: Request, res: Response) {
        try {
            const { id, email, provider } = req.body;

            if (!id || !email) {
                return res.status(400).json({ error: 'User ID and email are required' });
            }

            let user = await UserModel.findByEmail(email);

            if (!user) {
                user = await UserModel.create({
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

                LoggerService.info('New user registered via social auth', { userId: user.id, provider });
            } else if (user.is_blocked) {
                if (user.block_until && new Date(user.block_until) < new Date()) {
                    await UserModel.update(user.id, {
                        is_blocked: false,
                        block_reason: null,
                        block_until: null
                    });
                } else {
                    return res.status(403).json({
                        error: 'Account is blocked',
                        reason: user.block_reason,
                        until: user.block_until
                    });
                }
            }

            const token = generateToken(user.id);

            LoggerService.info('User logged in via social auth', { userId: user.id, provider });

            res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: user.role
                }
            });
        } catch (error) {
            LoggerService.error('Error in social login', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async sendPhoneOtp(req: Request, res: Response) {
        try {
            const { phone } = req.body;

            if (!phone) {
                return res.status(400).json({ error: 'Phone number is required' });
            }

            await AuthService.sendPhoneOtp(phone);
            res.json({ message: 'OTP sent successfully' });
        } catch (error) {
            LoggerService.error('Error sending OTP', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async verifyPhoneOtp(req: Request, res: Response) {
        try {
            const { phone, otp } = req.body;

            if (!phone || !otp) {
                return res.status(400).json({ error: 'Phone number and OTP are required' });
            }

            const { user, session } = await AuthService.loginWithPhone(phone, otp);

            const token = generateToken(user.id);

            LoggerService.info('User logged in with phone', { userId: user.id });

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
        } catch (error) {
            LoggerService.error('Error verifying OTP', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async logout(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            LoggerService.info('User logged out', { userId: req.user.id });

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            LoggerService.error('Error logging out', { error, userId: req.user?.id });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async resetPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await AuthService.resetPassword(email);
            res.json({ message: 'Password reset instructions sent to your email' });
        } catch (error) {
            LoggerService.error('Error resetting password', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async updatePassword(req: AuthRequest, res: Response) {
        try {
            const { newPassword } = req.body;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await AuthService.updatePassword(userId, newPassword);
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            LoggerService.error('Error updating password', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getCurrentUser(req: AuthRequest, res: Response) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const user = await UserModel.findById(req.user.id);
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
        } catch (error) {
            LoggerService.error('Error getting current user', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async refreshToken(req: AuthRequest, res: Response) {
        try {
            const { refresh_token } = req.body;

            const { data, error } = await AuthService.refreshSession(refresh_token);

            if (error) {
                return res.status(401).json({ error: 'Invalid refresh token' });
            }

            const user = await UserModel.findById(data.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const token = generateToken(user.id);

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
        } catch (error) {
            LoggerService.error('Error refreshing token', { error });
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    async getProfile(req: Request, res: Response) {
        try {
            const user = await UserModel.findById((req as any).user.id);
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: 'Ошибка при получении профиля' });
        }
    }
}; 