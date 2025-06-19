import React from 'react';
import { Grid, Container, Typography, Box } from '@mui/material';
import { PropertyCard } from './PropertyCard';
import { Property } from '../../types/property';
import { PropertyFilters } from './PropertyFilters';

interface PropertyListProps {
    properties: Property[];
    loading: boolean;
    error: string | null;
    onFilterChange: (filters: PropertyFilters) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({
    properties,
    loading,
    error,
    onFilterChange
}) => {
    if (loading) {
        return (
            <Container>
                <Typography>Загрузка...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    if (properties.length === 0) {
        return (
            <Container>
                <Typography>Объекты не найдены</Typography>
            </Container>
        );
    }

    return (
        <Container>
            <Box sx={{ mb: 4 }}>
                <PropertyFilters onFilterChange={onFilterChange} />
            </Box>

            <Grid container spacing={3}>
                {properties.map((property) => (
                    <Grid item xs={12} sm={6} md={4} key={property.id}>
                        <PropertyCard property={property} />
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}; 