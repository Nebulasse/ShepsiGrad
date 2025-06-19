import { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { api } from '../services/api';

export const usePropertyDetails = (propertyId: string) => {
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPropertyDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/properties/${propertyId}`);
            setProperty(response.data);
        } catch (err) {
            setError('Ошибка при загрузке информации об объекте');
            console.error('Error fetching property details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (propertyId) {
            fetchPropertyDetails();
        }
    }, [propertyId]);

    return {
        property,
        loading,
        error,
        refreshProperty: fetchPropertyDetails
    };
}; 