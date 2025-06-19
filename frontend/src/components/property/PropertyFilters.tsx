import React, { useState } from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Slider,
    Typography
} from '@mui/material';
import { PropertyFilters as PropertyFiltersType } from '../../types/property';

interface PropertyFiltersProps {
    onFilterChange: (filters: PropertyFiltersType) => void;
}

const propertyTypes = [
    'Квартира',
    'Дом',
    'Вилла',
    'Апартаменты',
    'Коттедж'
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<PropertyFiltersType>({
        city: '',
        property_type: '',
        min_price: 0,
        max_price: 100000,
        bedrooms: 0,
        bathrooms: 0
    });

    const handleChange = (field: keyof PropertyFiltersType) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePriceChange = (event: Event, newValue: number | number[]) => {
        const [min, max] = newValue as number[];
        setFilters(prev => ({
            ...prev,
            min_price: min,
            max_price: max
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onFilterChange(filters);
    };

    const handleReset = () => {
        setFilters({
            city: '',
            property_type: '',
            min_price: 0,
            max_price: 100000,
            bedrooms: 0,
            bathrooms: 0
        });
        onFilterChange({});
    };

    return (
        <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            label="Город"
                            value={filters.city}
                            onChange={handleChange('city')}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            select
                            label="Тип недвижимости"
                            value={filters.property_type}
                            onChange={handleChange('property_type')}
                        >
                            <MenuItem value="">Все</MenuItem>
                            {propertyTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Спальни"
                            value={filters.bedrooms}
                            onChange={handleChange('bedrooms')}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Ванные"
                            value={filters.bathrooms}
                            onChange={handleChange('bathrooms')}
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography gutterBottom>Цена за день</Typography>
                        <Slider
                            value={[filters.min_price, filters.max_price]}
                            onChange={handlePriceChange}
                            valueLabelDisplay="auto"
                            min={0}
                            max={100000}
                            step={1000}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                                {filters.min_price} ₽
                            </Typography>
                            <Typography variant="body2">
                                {filters.max_price} ₽
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={handleReset}
                            >
                                Сбросить
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                            >
                                Применить
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}; 