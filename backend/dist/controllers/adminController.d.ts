import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const adminController: {
    getUserStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getPropertyStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getBookingStats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserActivity(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    blockUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    unblockUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getBlockedUsers(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
