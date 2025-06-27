import { Router, RequestHandler } from 'express';
import { AuthenticatedRequest, wrapAuthHandler, AuthHandler } from '../middleware/auth.middleware';

/**
 * Утилита для создания типизированных маршрутов с аутентификацией
 */
export class TypedRouter {
  private router: Router;

  constructor() {
    this.router = Router();
  }

  /**
   * GET запрос без аутентификации
   */
  get(path: string, ...handlers: RequestHandler[]): TypedRouter {
    this.router.get(path, ...handlers);
    return this;
  }

  /**
   * POST запрос без аутентификации
   */
  post(path: string, ...handlers: RequestHandler[]): TypedRouter {
    this.router.post(path, ...handlers);
    return this;
  }

  /**
   * PUT запрос без аутентификации
   */
  put(path: string, ...handlers: RequestHandler[]): TypedRouter {
    this.router.put(path, ...handlers);
    return this;
  }

  /**
   * DELETE запрос без аутентификации
   */
  delete(path: string, ...handlers: RequestHandler[]): TypedRouter {
    this.router.delete(path, ...handlers);
    return this;
  }

  /**
   * PATCH запрос без аутентификации
   */
  patch(path: string, ...handlers: RequestHandler[]): TypedRouter {
    this.router.patch(path, ...handlers);
    return this;
  }

  /**
   * GET запрос с аутентификацией
   */
  getAuth(path: string, handler: AuthHandler, ...middlewares: RequestHandler[]): TypedRouter {
    this.router.get(path, ...middlewares, wrapAuthHandler(handler));
    return this;
  }

  /**
   * POST запрос с аутентификацией
   */
  postAuth(path: string, handler: AuthHandler, ...middlewares: RequestHandler[]): TypedRouter {
    this.router.post(path, ...middlewares, wrapAuthHandler(handler));
    return this;
  }

  /**
   * PUT запрос с аутентификацией
   */
  putAuth(path: string, handler: AuthHandler, ...middlewares: RequestHandler[]): TypedRouter {
    this.router.put(path, ...middlewares, wrapAuthHandler(handler));
    return this;
  }

  /**
   * DELETE запрос с аутентификацией
   */
  deleteAuth(path: string, handler: AuthHandler, ...middlewares: RequestHandler[]): TypedRouter {
    this.router.delete(path, ...middlewares, wrapAuthHandler(handler));
    return this;
  }

  /**
   * PATCH запрос с аутентификацией
   */
  patchAuth(path: string, handler: AuthHandler, ...middlewares: RequestHandler[]): TypedRouter {
    this.router.patch(path, ...middlewares, wrapAuthHandler(handler));
    return this;
  }

  /**
   * Получить экземпляр Router
   */
  getRouter(): Router {
    return this.router;
  }
}

/**
 * Создать типизированный маршрутизатор
 */
export const createTypedRouter = (): TypedRouter => {
  return new TypedRouter();
}; 