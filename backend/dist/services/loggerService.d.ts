import winston from 'winston';
declare const logger: winston.Logger;
export { logger };
export declare class LoggerService {
    static error(message: string, meta?: any): void;
    static warn(message: string, meta?: any): void;
    static info(message: string, meta?: any): void;
    static http(message: string, meta?: any): void;
    static debug(message: string, meta?: any): void;
    static logHttpRequest(req: any, res: any, responseTime: number): void;
    static logError(error: Error, req?: any): void;
}
