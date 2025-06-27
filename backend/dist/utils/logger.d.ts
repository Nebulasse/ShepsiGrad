import winston, { Logger } from 'winston';
declare const logger: winston.Logger;
/**
 * Получить логгер для конкретного модуля
 * @param moduleName Имя модуля
 * @returns Экземпляр логгера
 */
export declare const getModuleLogger: (moduleName: string) => Logger;
export default logger;
