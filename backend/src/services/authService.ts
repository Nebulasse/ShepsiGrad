import axios from 'axios';
import { supabase } from '../config/supabase';
import { UserModel } from '../models/User';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/appConfig';
import jwt from 'jsonwebtoken';

export class AuthService {
    static async register(email: string, password: string, userData: {
        full_name: string;
        phone_number?: string;
        role?: 'user' | 'admin' | 'landlord';
    }) {
        // Регистрация в Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User registration failed');

        // Создание записи в нашей базе данных
        const user = await UserModel.create({
            id: authData.user.id,
            email,
            ...userData,
            role: userData.role || 'user'
        });

        return {
            user,
            session: authData.session
        };
    }

    static async login(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Login failed');

        const user = await UserModel.findById(data.user.id);
        if (!user) throw new Error('User not found');

        return {
            user,
            session: data.session
        };
    }

    static async loginWithPhone(phone: string, otp: string) {
        // Проверяем OTP код, отправленный на телефон
        const { data, error } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms'
        });

        if (error) throw error;
        if (!data.user) throw new Error('Phone verification failed');

        // Поиск или создание пользователя в нашей БД
        let user = await UserModel.findById(data.user.id);
        
        // Если пользователя нет в нашей БД, создаем его
        if (!user) {
            user = await UserModel.create({
                id: data.user.id,
                email: data.user.email || `${phone}@phone.user`,
                phone_number: phone,
                full_name: data.user.user_metadata.full_name || 'User',
                role: 'user',
                is_blocked: false,
                block_reason: null,
                block_until: null
            });
        }

        return {
            user,
            session: data.session
        };
    }

    static async sendPhoneOtp(phone: string) {
        const { data, error } = await supabase.auth.signInWithOtp({
            phone
        });

        if (error) throw error;
        return { message: 'OTP sent successfully' };
    }

    static async refreshSession(refreshToken: string) {
        return await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });
    }

    static async resetPassword(email: string) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        });
        
        if (error) throw error;
        return { message: 'Password reset email sent' };
    }

    static async updatePassword(userId: string, newPassword: string) {
        // Обновляем пароль в Supabase
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (error) throw error;
        
        // Если в нашей БД тоже хранится пароль, обновляем и его
        // Однако при интеграции с Supabase обычно локально пароли не хранятся
        
        return { message: 'Password updated successfully' };
    }

    static async getCurrentUser(token: string) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) throw new Error('Invalid token');

        const userData = await UserModel.findById(user.id);
        if (!userData) throw new Error('User not found');

        return userData;
    }
} 