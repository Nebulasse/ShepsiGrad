import { supabase } from '../config/supabase';

export interface Notification {
    id: string;
    user_id: string;
    type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'system';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    metadata?: Record<string, any>;
}

export class NotificationModel {
    static async create(data: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
        const { data: notification, error } = await supabase
            .from('notifications')
            .insert([{
                ...data,
                is_read: false
            }])
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    static async findById(id: string) {
        const { data: notification, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return notification;
    }

    static async findAll({
        start,
        end,
        filters = {}
    }: {
        start?: number;
        end?: number;
        filters?: {
            user_id?: string;
            read?: boolean;
            type?: string;
        };
    }): Promise<{ data: Notification[]; error: any; count: number }> {
        let query = supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }
        if (filters.read !== undefined) {
            query = query.eq('is_read', filters.read);
        }
        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (start !== undefined && end !== undefined) {
            query = query.range(start, end);
        }

        const { data, error, count } = await query;

        return {
            data: data || [],
            error,
            count: count || 0
        };
    }

    static async update(id: string, data: Partial<Notification>) {
        const { data: notification, error } = await supabase
            .from('notifications')
            .update(data)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return notification;
    }

    static async markAsRead(id: string) {
        return this.update(id, { is_read: true });
    }

    static async markAllAsRead(userId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    }

    static async delete(id: string) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    }
} 