"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncService = exports.SyncChannel = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
const loggerService_1 = require("./loggerService");
// Каналы для различных типов синхронизации
var SyncChannel;
(function (SyncChannel) {
    SyncChannel["PROPERTY_UPDATE"] = "PROPERTY_UPDATE";
    SyncChannel["CHAT_MESSAGE"] = "CHAT_MESSAGE";
    SyncChannel["NOTIFICATION"] = "NOTIFICATION";
    SyncChannel["BOOKING_UPDATE"] = "BOOKING_UPDATE";
    SyncChannel["USER_UPDATE"] = "USER_UPDATE";
    SyncChannel["FAVORITE_UPDATE"] = "FAVORITE_UPDATE";
})(SyncChannel || (exports.SyncChannel = SyncChannel = {}));
class SyncService {
    constructor() {
        this.pubsub = new graphql_subscriptions_1.PubSub();
        // Уникальный идентификатор для текущего экземпляра приложения
        this.applicationId = process.env.APP_ID || `app-${Math.random().toString(36).substr(2, 9)}`;
        loggerService_1.logger.info(`SyncService initialized with appId: ${this.applicationId}`);
    }
    // Публикация события синхронизации
    async publish(channel, type, payload, targetApps) {
        const syncEvent = {
            type,
            payload,
            timestamp: Date.now(),
            source: this.applicationId,
            targetApps
        };
        await this.pubsub.publish(channel, { [channel]: syncEvent });
        loggerService_1.logger.debug(`Published to ${channel}: ${type}`, { source: this.applicationId });
    }
    // Подписка на события синхронизации
    subscribe(channel, callback) {
        const asyncIterator = this.pubsub.asyncIterator([channel]);
        // Обработка событий из итератора
        const handleEvents = async () => {
            try {
                for await (const event of asyncIterator) {
                    const syncEvent = event[channel];
                    // Пропускаем события от текущего приложения
                    if (syncEvent.source === this.applicationId) {
                        continue;
                    }
                    // Проверяем, предназначено ли событие для этого приложения
                    if (syncEvent.targetApps && !syncEvent.targetApps.includes(this.applicationId)) {
                        continue;
                    }
                    callback(syncEvent);
                }
            }
            catch (error) {
                loggerService_1.logger.error('Error in sync event processing:', error instanceof Error ? error.message : 'Unknown error');
            }
        };
        // Запускаем обработку в фоновом режиме
        handleEvents().catch(err => {
            loggerService_1.logger.error('Error in sync subscription:', err instanceof Error ? err.message : 'Unknown error');
        });
        // Возвращаем функцию для отписки
        return () => {
            this.pubsub.unsubscribe(asyncIterator);
        };
    }
    // Метод для синхронизации моделей MongoDB
    async setupModelSync(model, channel) {
        // Настраиваем обработчики событий MongoDB для публикации изменений
        model.watch().on('change', async (change) => {
            const operationType = change.operationType;
            const documentId = change.documentKey._id;
            // Получаем актуальные данные документа для операций, которые их изменяют
            let document = null;
            if (['insert', 'update', 'replace'].includes(operationType)) {
                document = await model.findById(documentId).lean();
            }
            // Публикуем событие синхронизации
            await this.publish(channel, operationType, {
                documentId,
                document,
                operationType
            });
        });
        // Подписываемся на события синхронизации от других экземпляров
        this.subscribe(channel, async (event) => {
            const { documentId, document, operationType } = event.payload;
            try {
                switch (operationType) {
                    case 'insert':
                    case 'replace':
                        if (document) {
                            await model.findByIdAndUpdate(documentId, document, { upsert: true });
                        }
                        break;
                    case 'update':
                        if (document) {
                            await model.findByIdAndUpdate(documentId, document);
                        }
                        break;
                    case 'delete':
                        await model.findByIdAndDelete(documentId);
                        break;
                }
            }
            catch (error) {
                loggerService_1.logger.error(`Error syncing ${model.modelName}:`, error instanceof Error ? error.message : 'Unknown error');
            }
        });
    }
}
// Экспортируем единственный экземпляр сервиса
exports.syncService = new SyncService();
