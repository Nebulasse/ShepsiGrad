import { supabase } from '../config/supabase';

export interface Chat {
    id: string;
    booking_id?: string;
    property_id?: string;
    guest_id: string;
    host_id: string;
    last_message?: string;
    last_message_time?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Message {
    id: string;
    chat_id: string;
    sender_id: string;
    content: string;
    is_read: boolean;
    created_at: Date;
}

export class ChatModel {
    static async createChat(chatData: Omit<Chat, 'id' | 'created_at' | 'updated_at'>): Promise<Chat> {
        const { data, error } = await supabase
            .from('chats')
            .insert(chatData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async findChatById(id: string): Promise<Chat | null> {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async findUserChats(userId: string): Promise<Chat[]> {
        const { data, error } = await supabase
            .from('chats')
            .select('*')
            .or(`guest_id.eq.${userId},host_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async findOrCreatePropertyChat(guestId: string, hostId: string, propertyId: string): Promise<Chat> {
        // Сначала ищем существующий чат для этой недвижимости между этими пользователями
        const { data: existingChat, error: findError } = await supabase
            .from('chats')
            .select('*')
            .eq('property_id', propertyId)
            .eq('guest_id', guestId)
            .eq('host_id', hostId)
            .maybeSingle();

        if (findError) throw findError;

        // Если чат найден, возвращаем его
        if (existingChat) {
            return existingChat;
        }

        // Если чат не найден, создаем новый
        const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
                property_id: propertyId,
                guest_id: guestId,
                host_id: hostId
            })
            .select()
            .single();

        if (createError) throw createError;
        return newChat;
    }

    static async findOrCreateBookingChat(guestId: string, hostId: string, bookingId: string): Promise<Chat> {
        // Сначала ищем существующий чат для этого бронирования
        const { data: existingChat, error: findError } = await supabase
            .from('chats')
            .select('*')
            .eq('booking_id', bookingId)
            .maybeSingle();

        if (findError) throw findError;

        // Если чат найден, возвращаем его
        if (existingChat) {
            return existingChat;
        }

        // Если чат не найден, создаем новый
        const { data: newChat, error: createError } = await supabase
            .from('chats')
            .insert({
                booking_id: bookingId,
                guest_id: guestId,
                host_id: hostId
            })
            .select()
            .single();

        if (createError) throw createError;
        return newChat;
    }

    static async updateLastMessage(chatId: string, lastMessage: string): Promise<void> {
        const { error } = await supabase
            .from('chats')
            .update({
                last_message: lastMessage,
                last_message_time: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', chatId);

        if (error) throw error;
    }
}

export class MessageModel {
    static async createMessage(messageData: Omit<Message, 'id' | 'created_at'>): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert(messageData)
            .select()
            .single();

        if (error) throw error;

        // Обновляем информацию о последнем сообщении в чате
        await ChatModel.updateLastMessage(messageData.chat_id, messageData.content);

        return data;
    }

    static async getChatMessages(
        chatId: string,
        { page = 1, limit = 20 }: { page?: number; limit?: number } = {}
    ): Promise<{ messages: Message[]; total: number }> {
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, error, count } = await supabase
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('chat_id', chatId)
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) throw error;

        return {
            messages: data || [],
            total: count || 0
        };
    }

    static async getChatUnreadCount(chatId: string, userId: string): Promise<{ count: number }> {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('chat_id', chatId)
            .neq('sender_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return { count: count || 0 };
    }

    static async markAsRead(chatId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('chat_id', chatId)
            .neq('sender_id', userId)
            .eq('is_read', false);

        if (error) throw error;
    }

    static async getUnreadCount(userId: string): Promise<number> {
        // Сначала находим все чаты пользователя
        const { data: chats, error: chatError } = await supabase
            .from('chats')
            .select('id')
            .or(`guest_id.eq.${userId},host_id.eq.${userId}`);

        if (chatError) throw chatError;

        if (!chats || chats.length === 0) {
            return 0;
        }

        const chatIds = chats.map(chat => chat.id);

        // Затем считаем непрочитанные сообщения в этих чатах
        const { count, error: countError } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .in('chat_id', chatIds)
            .neq('sender_id', userId)
            .eq('is_read', false);

        if (countError) throw countError;
        return count || 0;
    }
} 