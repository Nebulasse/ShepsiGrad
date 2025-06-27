"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Загружаем переменные окружения из .env файла
dotenv_1.default.config();
// Функция для получения переменной окружения с проверкой наличия
const getEnv = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (value === undefined) {
        throw new Error(`Переменная окружения ${key} не определена`);
    }
    return value;
};
// Конфигурация приложения
exports.env = {
    app: {
        port: parseInt(getEnv('PORT', '3000'), 10),
        environment: getEnv('NODE_ENV', 'development'),
        isDev: getEnv('NODE_ENV', 'development') === 'development',
        isProd: getEnv('NODE_ENV', 'development') === 'production',
        isTest: getEnv('NODE_ENV', 'development') === 'test',
        apiPrefix: getEnv('API_PREFIX', '/api'),
        corsOrigin: getEnv('CORS_ORIGIN', '*'),
    },
    database: {
        url: process.env.DATABASE_URL,
        host: getEnv('DB_HOST', 'localhost'),
        port: parseInt(getEnv('DB_PORT', '5432'), 10),
        username: getEnv('DB_USERNAME', 'postgres'),
        password: getEnv('DB_PASSWORD', 'postgres'),
        database: getEnv('DB_NAME', 'rental_app'),
        ssl: process.env.DB_SSL === 'true',
    },
    jwt: {
        secret: getEnv('JWT_SECRET', 'secret-key'),
        accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'), // 15 минут
        refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'), // 7 дней
    },
    email: {
        host: getEnv('EMAIL_HOST', 'smtp.example.com'),
        port: parseInt(getEnv('EMAIL_PORT', '587'), 10),
        user: getEnv('EMAIL_USER', 'user@example.com'),
        password: getEnv('EMAIL_PASSWORD', 'password'),
        from: getEnv('EMAIL_FROM', 'noreply@rentalapp.com'),
    },
    storage: {
        provider: getEnv('STORAGE_PROVIDER', 'local'), // local, s3, minio
        s3: {
            bucket: getEnv('S3_BUCKET', 'rental-app'),
            region: getEnv('S3_REGION', 'eu-central-1'),
            accessKey: process.env.S3_ACCESS_KEY,
            secretKey: process.env.S3_SECRET_KEY,
            endpoint: process.env.S3_ENDPOINT,
            accessKeyId: process.env.S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
        },
        minio: {
            endpoint: getEnv('MINIO_ENDPOINT', 'localhost'),
            port: parseInt(getEnv('MINIO_PORT', '9000'), 10),
            bucket: getEnv('MINIO_BUCKET', 'rental-app'),
            accessKey: getEnv('MINIO_ACCESS_KEY', 'minioadmin'),
            secretKey: getEnv('MINIO_SECRET_KEY', 'minioadmin'),
            useSSL: process.env.MINIO_USE_SSL === 'true',
        },
        local: {
            uploadDir: getEnv('UPLOAD_DIR', './uploads'),
        },
    },
    redis: {
        host: getEnv('REDIS_HOST', 'localhost'),
        port: parseInt(getEnv('REDIS_PORT', '6379'), 10),
        password: process.env.REDIS_PASSWORD,
    },
    logging: {
        level: getEnv('LOG_LEVEL', 'info'),
        file: process.env.LOG_FILE,
    },
};
/**
 * Проверка обязательных переменных окружения
 */
const validateEnv = () => {
    const requiredEnvVars = ['JWT_SECRET'];
    // В production добавляем больше обязательных переменных
    if (exports.env.app.environment === 'production') {
        requiredEnvVars.push('DATABASE_URL', 'REDIS_URL', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'EMAIL_USER', 'EMAIL_PASSWORD', 'PAYMENT_SECRET_KEY');
    }
    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    }
};
exports.validateEnv = validateEnv;
exports.default = exports.env;
