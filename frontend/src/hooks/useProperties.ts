import { useState, useEffect } from 'react';
import { Property, PropertyFilters } from '../types/property';
import { api } from '../services/api';

export const useProperties = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [total, setTotal] = useState(0);

    const fetchProperties = async (currentFilters: PropertyFilters = {}) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, value.toString());
                }
            });

            const response = await api.get(`/properties?${params.toString()}`);
            setProperties(response.data.properties);
            setTotal(response.data.total);
        } catch (err) {
            setError('Ошибка при загрузке объектов');
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: PropertyFilters) => {
        setFilters(newFilters);
        fetchProperties(newFilters);
    };

    useEffect(() => {
        fetchProperties(filters);
    }, []);

    return {
        properties,
        loading,
        error,
        total,
        filters,
        handleFilterChange,
        refreshProperties: () => fetchProperties(filters)
    };
}; 