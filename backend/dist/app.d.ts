import { Express } from 'express';
declare const app: Express;
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
declare const startServer: () => Promise<void>;
export { app, startServer };
export default httpServer;
