import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const mapController: {
    geocodeAddress(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    reverseGeocode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    findNearbyPlaces(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getDistance(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getPropertiesInArea(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
