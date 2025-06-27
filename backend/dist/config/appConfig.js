"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.appConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Загружаем переменные окружения из .env файла
dotenv_1.default.config();
// Конфигурация приложения
exports.appConfig = {
    app: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        apiUrl: process.env.API_URL || 'http://localhost:3000/api',
        nodeEnv: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || '/api',
        corsOrigin: process.env.CORS_ORIGIN || '*',
    },
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'rental_management',
        ssl: process.env.DB_SSL === 'true',
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10),
    },
    payment: {
        yookassa: {
            shopId: process.env.YOOKASSA_SHOP_ID || '',
            secretKey: process.env.YOOKASSA_SECRET_KEY || '',
        },
        stripe: {
            secretKey: process.env.STRIPE_SECRET_KEY || '',
            publicKey: process.env.STRIPE_PUBLIC_KEY || '',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
        },
        returnUrl: process.env.PAYMENT_RETURN_URL || 'http://localhost:3000/payment/success',
    },
    storage: {
        type: process.env.STORAGE_TYPE || 'local',
        local: {
            uploadDir: process.env.UPLOAD_DIR || path_1.default.resolve(__dirname, '../../uploads'),
        },
        s3: process.env.STORAGE_TYPE === 's3'
            ? {
                accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
                bucket: process.env.S3_BUCKET || '',
                region: process.env.S3_REGION || 'eu-central-1',
            }
            : undefined,
    },
    cors: {
        origin: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',')
            : ['http://localhost:3000', 'http://localhost:19006'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || path_1.default.resolve(__dirname, '../../logs/app.log'),
    },
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_KEY || '',
        bucketName: process.env.SUPABASE_BUCKET || 'property-images',
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
};
// Экспорт отдельных переменных для удобства использования
exports.JWT_SECRET = exports.appConfig.auth.jwtSecret;
exports.JWT_EXPIRES_IN = exports.appConfig.auth.jwtExpiresIn;
exports.config = exports.appConfig;
exports.default = exports.appConfig;
