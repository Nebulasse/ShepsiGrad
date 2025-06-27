import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * Интерфейс для JWT токена
 */
export interface TokenPayload {
  userId: string;
  role: string;
  [key: string]: any;
}

/**
 * Генерирует JWT токен
 * @param payload Данные для включения в токен
 * @param expiresIn Время жизни токена
 * @returns JWT токен
 */
export const generateToken = (payload: TokenPayload, expiresIn: string = config.jwt.accessExpiresIn): string => {
  const options: SignOptions = {
    expiresIn
  };
  
  return jwt.sign(payload, config.jwt.secret, options);
};

/**
 * Верифицирует JWT токен
 * @param token JWT токен
 * @returns Расшифрованные данные токена или null в случае ошибки
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return {
      userId: decoded.userId,
      role: decoded.role,
      ...decoded
    };
  } catch (error) {
    return null;
  }
};

/**
 * Генерирует пару токенов (access и refresh)
 * @param payload Данные для включения в токен
 * @returns Объект с access и refresh токенами
 */
export const generateTokenPair = (payload: TokenPayload): { accessToken: string; refreshToken: string } => {
  const accessToken = generateToken(payload, config.jwt.accessExpiresIn);
  const refreshToken = generateToken(payload, config.jwt.refreshExpiresIn);
  
  return {
    accessToken,
    refreshToken
  };
};

/**
 * Получает время истечения токена
 * @param token JWT токен
 * @returns Время истечения токена в миллисекундах или null в случае ошибки
 */
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (decoded && decoded.exp) {
      return decoded.exp * 1000; // Конвертируем в миллисекунды
    }
    return null;
  } catch (error) {
    return null;
  }
}; 