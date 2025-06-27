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
export declare const appConfig: AppConfig;
export declare const JWT_SECRET: string;
export declare const JWT_EXPIRES_IN: string;
export declare const config: AppConfig;
export default appConfig;
