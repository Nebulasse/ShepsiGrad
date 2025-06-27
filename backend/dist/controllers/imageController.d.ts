import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const uploadMiddleware: any;
export declare const imageController: {
    uploadImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
