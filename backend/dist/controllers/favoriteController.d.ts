import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
declare const favoriteController: {
    addToFavorites: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    removeFromFavorites: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getUserFavorites: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    checkIsFavorite: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default favoriteController;
