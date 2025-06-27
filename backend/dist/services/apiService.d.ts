import express from 'express';
interface ApiServiceOptions {
    port?: number;
    enableCors?: boolean;
    allowedOrigins?: string[];
}
declare class ApiService {
    private app;
    private port;
    private enableCors;
    private allowedOrigins;
    private isInitialized;
    constructor(options?: ApiServiceOptions);
    initialize(): Promise<void>;
    addRoutes(routes: express.Router): void;
    setupWebsocketHandlers(server: any): void;
    private setupSocketEventListeners;
    private setupSyncEventBridges;
}
export declare const apiService: ApiService;
export {};
