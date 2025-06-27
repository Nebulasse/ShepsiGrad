import { User } from '../models/User';
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
}
export interface AuthResult {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}
/**
 * Сервис для работы с аутентификацией и авторизацией
 */
export declare class AuthService {
    /**
     * Регистрация нового пользователя
     * @param userData Данные пользователя
     * @returns Результат регистрации
     */
    static register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phone?: string;
        role?: string;
    }): Promise<User>;
    /**
     * Вход пользователя
     * @param email Email пользователя
     * @param password Пароль пользователя
     * @returns Результат входа
     */
    static login(email: string, password: string): Promise<AuthResult>;
    /**
     * Обновление токена доступа
     * @param refreshToken Токен обновления
     * @returns Новые токены
     */
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    /**
     * Подтверждение email пользователя
     * @param token Токен подтверждения
     * @returns Пользователь после подтверждения
     */
    static verifyEmail(token: string): Promise<User>;
    /**
     * Запрос на сброс пароля
     * @param email Email пользователя
     * @returns true если запрос отправлен успешно
     */
    static requestPasswordReset(email: string): Promise<boolean>;
    /**
     * Сброс пароля
     * @param token Токен сброса
     * @param newPassword Новый пароль
     * @returns Пользователь после сброса пароля
     */
    static resetPassword(token: string, newPassword: string): Promise<User>;
    /**
     * Генерация токенов доступа и обновления
     * @param payload Полезная нагрузка для токенов
     * @returns Токены доступа и обновления
     */
    private static generateTokens;
}
export declare const authService: typeof AuthService;
