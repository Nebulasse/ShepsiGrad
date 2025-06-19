export interface PropertyImage {
    id: string;
    image_url: string;
    is_primary: boolean;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    features: {
        bedrooms: number;
        bathrooms: number;
        area: number;
        parking: boolean;
        furnished: boolean;
    };
    images: string[];
    status: 'available' | 'rented' | 'maintenance';
    createdAt: string;
    updatedAt: string;
    ownerId: string;
}

export interface PropertyFilters {
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    furnished?: boolean;
    city?: string;
    status?: Property['status'];
} 