import dotenv from 'dotenv';
import path from 'path';

// Загружаем переменные окружения из .env файла
dotenv.config();

interface AppConfig {
  app: {
    port: number;
    env: string;
    frontendUrl: string;
    apiUrl: string;
    nodeEnv: string;
    apiPrefix: string;
    corsOrigin: string;
  };
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    refreshTokenExpiresIn: string;
    saltRounds: number;
  };
  payment: {
    yookassa: {
      shopId: string;
      secretKey: string;
    };
    stripe: {
      secretKey: string;
      publicKey: string;
      webhookSecret: string;
    };
    returnUrl: string;
  };
  storage: {
    type: 'local' | 's3';
    local: {
      uploadDir: string;
    };
    s3?: {
      accessKeyId: string;
      secretAccessKey: string;
      bucket: string;
      region: string;
    };
  };
  cors: {
    origin: string | string[];
    methods: string[];
  };
  logging: {
    level: string;
    file: string;
  };
  supabase: {
    url: string;
    key: string;
    bucketName: string;
  };
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
  };
}

// Конфигурация приложения
export const appConfig: AppConfig = {
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
    type: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
    local: {
      uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
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
    file: process.env.LOG_FILE || path.resolve(__dirname, '../../logs/app.log'),
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
export const JWT_SECRET = appConfig.auth.jwtSecret;
export const JWT_EXPIRES_IN = appConfig.auth.jwtExpiresIn;
export const config = appConfig;

export default appConfig;