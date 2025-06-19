import { supabase } from '../config/supabase';

export interface Property {
    id: string;
    owner_id: string;
    title: string;
    description: string;
    address: string;
    city: string;
    price_per_day: number;
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    max_guests: number;
    status: 'active' | 'inactive' | 'maintenance';
    amenities?: string[];
    rules?: string[];
    created_at: Date;
    updated_at: Date;
}

export interface PropertyImage {
    id: string;
    property_id: string;
    image_url: string;
    is_primary: boolean;
    created_at: Date;
}

export class PropertyModel {
    static async create(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>, images?: string[]): Promise<Property> {
        const { data: property, error: propertyError } = await supabase
            .from('properties')
            .insert(propertyData)
            .select()
            .single();

        if (propertyError) throw propertyError;

        if (images && images.length > 0) {
            const imageRecords = images.map((url, index) => ({
                property_id: property.id,
                image_url: url,
                is_primary: index === 0
            }));

            const { error: imagesError } = await supabase
                .from('property_images')
                .insert(imageRecords);

            if (imagesError) throw imagesError;
        }

        return property;
    }

    static async findById(id: string): Promise<Property & { images: PropertyImage[] } | null> {
        const { data, error } = await supabase
            .from('properties')
            .select(`
                *,
                property_images (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async findAll({
        start,
        end,
        filters = {}
    }: {
        start?: number;
        end?: number;
        filters?: {
            city?: string;
            property_type?: string;
            min_price?: number;
            max_price?: number;
            owner_id?: string;
            min_bedrooms?: number;
            min_bathrooms?: number;
            min_guests?: number;
            amenities?: string[];
        };
    }): Promise<{ data: Property[]; error: any; count: number }> {
        let query = supabase
            .from('properties')
            .select('*', { count: 'exact' })
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

        return {
            data: data || [],
            error,
            count: count || 0
        };
    }

    static async update(id: string, propertyData: Partial<Property>): Promise<Property> {
        const { data, error } = await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    static async addPropertyImages(propertyId: string, imageUrls: string[]): Promise<PropertyImage[]> {
        if (!imageUrls || imageUrls.length === 0) {
            return [];
        }

        const { data: existingImages } = await supabase
            .from('property_images')
            .select('*')
            .eq('property_id', propertyId);

        const hasPrimary = existingImages && existingImages.some(img => img.is_primary);
        
        const imageRecords = imageUrls.map((url, index) => ({
            property_id: propertyId,
            image_url: url,
            is_primary: !hasPrimary && index === 0
        }));

        const { data, error } = await supabase
            .from('property_images')
            .insert(imageRecords)
            .select();

        if (error) throw error;
        return data;
    }

    static async deletePropertyImage(imageId: string): Promise<void> {
        const { error } = await supabase
            .from('property_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;
    }

    static async setPrimaryImage(imageId: string, propertyId: string): Promise<void> {
        const { error: resetError } = await supabase
            .from('property_images')
            .update({ is_primary: false })
            .eq('property_id', propertyId);

        if (resetError) throw resetError;

        const { error } = await supabase
            .from('property_images')
            .update({ is_primary: true })
            .eq('id', imageId);

        if (error) throw error;
    }
} 