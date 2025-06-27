"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyModel = void 0;
const supabase_1 = require("../config/supabase");
// Кэш для часто запрашиваемых свойств
const propertyCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут
class PropertyModel {
    static async create(propertyData, images) {
        const { data: property, error: propertyError } = await supabase_1.supabase
            .from('properties')
            .insert(propertyData)
            .select()
            .single();
        if (propertyError)
            throw propertyError;
        if (images && images.length > 0) {
            const imageRecords = images.map((url, index) => ({
                property_id: property.id,
                image_url: url,
                is_primary: index === 0
            }));
            const { error: imagesError } = await supabase_1.supabase
                .from('property_images')
                .insert(imageRecords);
            if (imagesError)
                throw imagesError;
        }
        return property;
    }
    static async findById(id) {
        // Проверяем кэш
        const cached = propertyCache.get(id);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return cached.data;
        }
        // Оптимизированный запрос с получением всех необходимых данных за один запрос
        const { data, error } = await supabase_1.supabase
            .from('properties')
            .select(`
                *,
                property_images (*),
                users!properties_owner_id_fkey (id, name, email, avatar_url),
                reviews!reviews_property_id_fkey (id, rating, comment, user_id, created_at)
            `)
            .eq('id', id)
            .single();
        if (error)
            throw error;
        // Сохраняем в кэш
        if (data) {
            propertyCache.set(id, {
                data,
                timestamp: Date.now()
            });
        }
        return data;
    }
    static async findAll({ start, end, filters = {} }) {
        // Создаем ключ кэша на основе параметров запроса
        const cacheKey = `properties_${start}_${end}_${JSON.stringify(filters)}`;
        const cached = propertyCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            return cached.data;
        }
        let query = supabase_1.supabase
            .from('properties')
            .select(`
                *,
                property_images (*)
            `, { count: 'exact' })
            .eq('status', 'active');
        if (filters.city) {
            query = query.eq('city', filters.city);
        }
        if (filters.property_type) {
            query = query.eq('property_type', filters.property_type);
        }
        if (filters.min_price) {
            query = query.gte('price_per_day', filters.min_price);
        }
        if (filters.max_price) {
            query = query.lte('price_per_day', filters.max_price);
        }
        if (filters.owner_id) {
            query = query.eq('owner_id', filters.owner_id);
        }
        if (filters.min_bedrooms) {
            query = query.gte('bedrooms', filters.min_bedrooms);
        }
        if (filters.min_bathrooms) {
            query = query.gte('bathrooms', filters.min_bathrooms);
        }
        if (filters.min_guests) {
            query = query.gte('max_guests', filters.min_guests);
        }
        if (filters.amenities && filters.amenities.length > 0) {
            query = query.contains('amenities', filters.amenities);
        }
        if (start !== undefined && end !== undefined) {
            query = query.range(start, end);
        }
        const { data, error, count } = await query
            .order('created_at', { ascending: false });
        const result = {
            data: data || [],
            error,
            count: count || 0
        };
        // Сохраняем результат в кэш
        propertyCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });
        return result;
    }
    static async update(id, propertyData) {
        const { data, error } = await supabase_1.supabase
            .from('properties')
            .update(propertyData)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        // Инвалидируем кэш при обновлении
        propertyCache.delete(id);
        // Очищаем кэш списков, так как они могут содержать это свойство
        for (const key of propertyCache.keys()) {
            if (key.startsWith('properties_')) {
                propertyCache.delete(key);
            }
        }
        return data;
    }
    static async delete(id) {
        const { error } = await supabase_1.supabase
            .from('properties')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
        // Инвалидируем кэш при удалении
        propertyCache.delete(id);
        // Очищаем кэш списков, так как они могут содержать это свойство
        for (const key of propertyCache.keys()) {
            if (key.startsWith('properties_')) {
                propertyCache.delete(key);
            }
        }
    }
    static async addPropertyImages(propertyId, imageUrls) {
        if (!imageUrls || imageUrls.length === 0) {
            return [];
        }
        const { data: existingImages } = await supabase_1.supabase
            .from('property_images')
            .select('*')
            .eq('property_id', propertyId);
        const hasPrimary = existingImages && existingImages.some(img => img.is_primary);
        const imageRecords = imageUrls.map((url, index) => ({
            property_id: propertyId,
            image_url: url,
            is_primary: !hasPrimary && index === 0
        }));
        const { data, error } = await supabase_1.supabase
            .from('property_images')
            .insert(imageRecords)
            .select();
        if (error)
            throw error;
        return data;
    }
    static async deletePropertyImage(imageId) {
        const { error } = await supabase_1.supabase
            .from('property_images')
            .delete()
            .eq('id', imageId);
        if (error)
            throw error;
    }
    static async setPrimaryImage(imageId, propertyId) {
        const { error: resetError } = await supabase_1.supabase
            .from('property_images')
            .update({ is_primary: false })
            .eq('property_id', propertyId);
        if (resetError)
            throw resetError;
        const { error } = await supabase_1.supabase
            .from('property_images')
            .update({ is_primary: true })
            .eq('id', imageId);
        if (error)
            throw error;
    }
}
exports.PropertyModel = PropertyModel;
