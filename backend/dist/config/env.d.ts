export declare const env: {
    app: {
        port: number;
        environment: string;
        isDev: boolean;
        isProd: boolean;
        isTest: boolean;
        apiPrefix: string;
        corsOrigin: string;
    };
    database: {
        url: string;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        ssl: boolean;
    };
    jwt: {
        secret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
    storage: {
        provider: string;
        s3: {
            bucket: string;
            region: string;
            accessKey: string;
            secretKey: string;
            endpoint: string;
            accessKeyId: string;
            secretAccessKey: string;
        };
        minio: {
            endpoint: string;
            port: number;
            bucket: string;
            accessKey: string;
            secretKey: string;
            useSSL: boolean;
        };
        local: {
            uploadDir: string;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string;
    };
    logging: {
        level: string;
        file: string;
    };
};
/**
 * Проверка обязательных переменных окружения
 */
export declare const validateEnv: () => void;
export default env;
