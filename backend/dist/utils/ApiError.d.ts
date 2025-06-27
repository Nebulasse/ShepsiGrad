/**
 * Класс для представления ошибок API
 */
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any[];
    /**
     * Создание экземпляра ApiError
     * @param statusCode HTTP код ошибки
     * @param message Сообщение об ошибке
     * @param isOperational Флаг операционной ошибки (не критической)
     * @param errors Массив ошибок (опционально)
     */
    constructor(statusCode: number, message: string, isOperational?: boolean, errors?: any[]);
    /**
     * Создание ошибки Bad Request (400)
     * @param message Сообщение об ошибке
     * @param errors Массив ошибок (опционально)
     * @returns Экземпляр ApiError
     */
    static badRequest(message: string, errors?: any[]): ApiError;
    /**
     * Создание ошибки Unauthorized (401)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static unauthorized(message?: string): ApiError;
    /**
     * Создание ошибки Forbidden (403)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static forbidden(message?: string): ApiError;
    /**
     * Создание ошибки Not Found (404)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static notFound(message?: string): ApiError;
    /**
     * Создание ошибки Conflict (409)
     * @param message Сообщение об ошибке
     * @returns Экземпляр ApiError
     */
    static conflict(message: string): ApiError;
    /**
     * Создание ошибки Internal Server Error (500)
     * @param message Сообщение об ошибке
     * @param isOperational Флаг операционной ошибки
     * @returns Экземпляр ApiError
     */
    static internal(message?: string, isOperational?: boolean): ApiError;
}
export default ApiError;
