export declare class AuthService {
    static register(email: string, password: string, userData: {
        full_name: string;
        phone_number?: string;
        role?: 'user' | 'admin' | 'landlord';
    }): Promise<{
        user: any;
        session: any;
    }>;
    static login(email: string, password: string): Promise<{
        user: any;
        session: any;
    }>;
    static loginWithPhone(phone: string, otp: string): Promise<{
        user: any;
        session: any;
    }>;
    static sendPhoneOtp(phone: string): Promise<{
        message: string;
    }>;
    static refreshSession(refreshToken: string): Promise<any>;
    static resetPassword(email: string): Promise<{
        message: string;
    }>;
    static updatePassword(userId: string, newPassword: string): Promise<{
        message: string;
    }>;
    static getCurrentUser(token: string): Promise<any>;
}
