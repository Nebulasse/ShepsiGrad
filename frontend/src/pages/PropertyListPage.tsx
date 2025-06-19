import React from 'react';
import { Container, Typography, Box, Pagination } from '@mui/material';
import { PropertyList } from '../components/property/PropertyList';
import { useProperties } from '../hooks/useProperties';

export const PropertyListPage: React.FC = () => {
    const {
        properties,
        loading,
        error,
        total,
        handleFilterChange,
        filters
    } = useProperties();

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        handleFilterChange({
            ...filters,
            page
        });
    };

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Объекты недвижимости
                </Typography>

                <PropertyList
                    properties={properties}
                    loading={loading}
                    error={error}
                    onFilterChange={handleFilterChange}
                />

                {total > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination
                            count={Math.ceil(total / (filters.limit || 10))}
                            page={filters.page || 1}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        </Container>
    );
}; 