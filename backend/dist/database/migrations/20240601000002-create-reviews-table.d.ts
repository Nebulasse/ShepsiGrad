/**
 * Миграция для создания таблицы отзывов
 */
export declare function up(): Promise<void>;
/**
 * Откат миграции
 */
export declare function down(): Promise<void>;
/**
 * SQL для создания таблицы отзывов и функций
 * Этот SQL будет выполнен на стороне Supabase через RPC
 */
