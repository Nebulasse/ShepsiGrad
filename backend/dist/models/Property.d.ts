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
export declare class PropertyModel {
    static create(propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at'>, images?: string[]): Promise<Property>;
    static findById(id: string): Promise<Property & {
        images: PropertyImage[];
    } | null>;
    static findAll({ start, end, filters }: {
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
    }): Promise<{
        data: Property[];
        error: any;
        count: number;
    }>;
    static update(id: string, propertyData: Partial<Property>): Promise<Property>;
    static delete(id: string): Promise<void>;
    static addPropertyImages(propertyId: string, imageUrls: string[]): Promise<PropertyImage[]>;
    static deletePropertyImage(imageId: string): Promise<void>;
    static setPrimaryImage(imageId: string, propertyId: string): Promise<void>;
}
