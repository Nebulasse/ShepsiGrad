/**
 * Класс для представления ошибок API
 */
export class ApiError extends Error {
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
  constructor(statusCode: number, message: string, isOperational = true, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    // Для корректной работы instanceof с наследованием от Error
    Object.setPrototypeOf(this, ApiError.prototype);
    
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Создание ошибки Bad Request (400)
   * @param message Сообщение об ошибке
   * @param errors Массив ошибок (опционально)
   * @returns Экземпляр ApiError
   */
  static badRequest(message: string, errors?: any[]): ApiError {
    return new ApiError(400, message, true, errors);
  }

  /**
   * Создание ошибки Unauthorized (401)
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static unauthorized(message = 'Требуется аутентификация'): ApiError {
    return new ApiError(401, message);
  }

  /**
   * Создание ошибки Forbidden (403)
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static forbidden(message = 'Доступ запрещен'): ApiError {
    return new ApiError(403, message);
  }

  /**
   * Создание ошибки Not Found (404)
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static notFound(message = 'Ресурс не найден'): ApiError {
    return new ApiError(404, message);
  }

  /**
   * Создание ошибки Conflict (409)
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  /**
   * Создание ошибки Internal Server Error (500)
   * @param message Сообщение об ошибке
   * @param isOperational Флаг операционной ошибки
   * @returns Экземпляр ApiError
   */
  static internal(message = 'Внутренняя ошибка сервера', isOperational = true): ApiError {
    return new ApiError(500, message, isOperational);
  }
}

export default ApiError; 