import { supabase } from '../config/supabase';

export interface Review {
    id: string;
    property_id: string;
    user_id: string;
    booking_id?: string;
    rating: number;
    comment: string;
    created_at: Date;
    updated_at: Date;
    landlord_reply?: string;
    landlord_reply_at?: Date;
    is_hidden?: boolean;
}

export class ReviewModel {
    /**
     * Создание нового отзыва
     * @param reviewData Данные отзыва
     * @returns Созданный отзыв
     */
    static async create(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .insert(reviewData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Получение отзыва по ID
     * @param id ID отзыва
     * @returns Отзыв или null, если не найден
     */
    static async findById(id: string): Promise<Review | null> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Получение отзывов для объекта недвижимости
     * @param propertyId ID объекта недвижимости
     * @param options Опции запроса (пагинация, сортировка)
     * @returns Список отзывов
     */
    static async findByPropertyId(
        propertyId: string,
        options: {
            limit?: number;
            offset?: number;
            orderBy?: string;
            orderDirection?: 'asc' | 'desc';
        } = {}
    ): Promise<{ data: Review[]; count: number }> {
        const {
            limit = 10,
            offset = 0,
            orderBy = 'created_at',
            orderDirection = 'desc',
        } = options;

        let query = supabase
            .from('reviews')
            .select('*', { count: 'exact' })
            .eq('property_id', propertyId)
            .eq('is_hidden', false)
            .order(orderBy, { ascending: orderDirection === 'asc' })
            .range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], count: count || 0 };
    }

    /**
     * Получение отзывов пользователя
     * @param userId ID пользователя
     * @returns Список отзывов
     */
    static async findByUserId(userId: string): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Обновление отзыва
     * @param id ID отзыва
     * @param reviewData Данные для обновления
     * @returns Обновленный отзыв
     */
    static async update(id: string, reviewData: Partial<Review>): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .update({ ...reviewData, updated_at: new Date() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Добавление ответа арендодателя на отзыв
     * @param id ID отзыва
     * @param reply Текст ответа
     * @returns Обновленный отзыв
     */
    static async addLandlordReply(id: string, reply: string): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                landlord_reply: reply,
                landlord_reply_at: new Date(),
                updated_at: new Date(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Скрытие отзыва (для модерации)
     * @param id ID отзыва
     * @param isHidden Флаг скрытия
     * @returns Обновленный отзыв
     */
    static async setHidden(id: string, isHidden: boolean): Promise<Review> {
        const { data, error } = await supabase
            .from('reviews')
            .update({
                is_hidden: isHidden,
                updated_at: new Date(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Удаление отзыва
     * @param id ID отзыва
     * @returns true если удаление успешно
     */
    static async delete(id: string): Promise<boolean> {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }

    /**
     * Расчет среднего рейтинга для объекта недвижимости
     * @param propertyId ID объекта недвижимости
     * @returns Средний рейтинг
     */
    static async getAverageRating(propertyId: string): Promise<number> {
        const { data, error } = await supabase
            .rpc('get_average_rating', { property_id_param: propertyId });

        if (error) throw error;
        return data || 0;
    }
} 