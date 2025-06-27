import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const chatController: {
    getUserChats(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getChatMessages(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    sendMessage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    createPropertyChat(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    createBookingChat(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUnreadCount(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    testChatConnection(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
