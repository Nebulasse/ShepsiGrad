/**
 * Класс для представления ошибок API
 * Позволяет создавать структурированные ошибки с кодом статуса и дополнительными данными
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: Array<{ field?: string; message: string }> | Record<string, any>;

  /**
   * Создает новый экземпляр ApiError
   * @param message Сообщение об ошибке
   * @param statusCode HTTP код статуса (по умолчанию 500)
   * @param isOperational Флаг, указывающий является ли ошибка операционной (ожидаемой)
   * @param errors Дополнительные данные об ошибках (например, ошибки валидации)
   */
  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errors?: Array<{ field?: string; message: string }> | Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    
    // Устанавливаем правильный прототип для корректной работы instanceof
    Object.setPrototypeOf(this, ApiError.prototype);
    
    // Захватываем стек ошибки
    Error.captureStackTrace(this, this.constructor);
    
    // Устанавливаем имя ошибки
    this.name = this.constructor.name;
  }

  /**
   * Создает ошибку для случая, когда ресурс не найден
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static notFound(message: string = 'Ресурс не найден'): ApiError {
    return new ApiError(message, 404, true);
  }

  /**
   * Создает ошибку для случая, когда запрос некорректен
   * @param message Сообщение об ошибке
   * @param errors Дополнительные данные об ошибках
   * @returns Экземпляр ApiError
   */
  static badRequest(
    message: string = 'Некорректный запрос',
    errors?: Array<{ field?: string; message: string }> | Record<string, any>
  ): ApiError {
    return new ApiError(message, 400, true, errors);
  }

  /**
   * Создает ошибку для случая, когда пользователь не авторизован
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static unauthorized(message: string = 'Требуется аутентификация'): ApiError {
    return new ApiError(message, 401, true);
  }

  /**
   * Создает ошибку для случая, когда у пользователя недостаточно прав
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static forbidden(message: string = 'Недостаточно прав для выполнения операции'): ApiError {
    return new ApiError(message, 403, true);
  }

  /**
   * Создает ошибку для случая внутренней ошибки сервера
   * @param message Сообщение об ошибке
   * @param isOperational Флаг, указывающий является ли ошибка операционной
   * @returns Экземпляр ApiError
   */
  static internal(message: string = 'Внутренняя ошибка сервера', isOperational: boolean = false): ApiError {
    return new ApiError(message, 500, isOperational);
  }

  /**
   * Создает ошибку для случая, когда сервис недоступен
   * @param message Сообщение об ошибке
   * @returns Экземпляр ApiError
   */
  static serviceUnavailable(message: string = 'Сервис временно недоступен'): ApiError {
    return new ApiError(message, 503, true);
  }

  /**
   * Создает ошибку для случая ошибки валидации
   * @param message Сообщение об ошибке
   * @param errors Массив ошибок валидации
   * @returns Экземпляр ApiError
   */
  static validationError(
    message: string = 'Ошибка валидации данных',
    errors: Array<{ field?: string; message: string }>
  ): ApiError {
    return new ApiError(message, 422, true, errors);
  }
} 