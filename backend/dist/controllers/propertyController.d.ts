import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const propertyController: {
    createProperty(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getProperties(req: AuthRequest, res: Response): Promise<void>;
    getPropertyById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    updateProperty(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteProperty(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getUserProperties(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    addPropertyImages(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deletePropertyImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    setPrimaryImage(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
