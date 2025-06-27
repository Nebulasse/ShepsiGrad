import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    socialLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    sendPhoneOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyPhoneOtp(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    resetPassword(req: Request, res: Response): Promise<void>;
    updatePassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
