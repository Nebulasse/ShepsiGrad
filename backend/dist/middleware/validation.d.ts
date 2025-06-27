import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateQuery: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateParams: (schema: any) => (req: Request, res: Response, next: NextFunction) => void;
