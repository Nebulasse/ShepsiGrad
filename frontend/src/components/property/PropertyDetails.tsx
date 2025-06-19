import React from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Chip,
    Rating,
    Divider,
    ImageList,
    ImageListItem
} from '@mui/material';
import { Property } from '../../types/property';
import { BookingForm } from '../booking/BookingForm';
import { useBooking } from '../../hooks/useBooking';
import { useNavigate } from 'react-router-dom';

interface PropertyDetailsProps {
    property: Property;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property }) => {
    const { createBooking, loading, error } = useBooking();
    const navigate = useNavigate();

    const handleBookingSubmit = async (data: any) => {
        const booking = await createBooking(data);
        if (booking) {
            navigate(`/bookings/${booking.id}`);
        }
    };

    return (
        <Box>
            <Grid container spacing={4}>
                {/* Галерея изображений */}
                <Grid item xs={12}>
                    <ImageList cols={3} rowHeight={300} gap={16}>
                        {property.images?.map((image) => (
                            <ImageListItem key={image.id}>
                                <img
                                    src={image.image_url}
                                    alt={property.title}
                                    loading="lazy"
                                    style={{ objectFit: 'cover', height: '100%' }}
                                />
                            </ImageListItem>
                        ))}
                    </ImageList>
                </Grid>

                {/* Основная информация */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            {property.title}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                            <Chip 
                                label={property.property_type} 
                                sx={{ mr: 1 }} 
                            />
                            <Chip 
                                label={`${property.bedrooms} спален`} 
                                sx={{ mr: 1 }} 
                            />
                            <Chip 
                                label={`${property.bathrooms} ванных`} 
                                sx={{ mr: 1 }} 
                            />
                            <Chip 
                                label={`До ${property.max_guests} гостей`} 
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Rating value={property.rating || 0} readOnly sx={{ mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                                {property.rating ? `${property.rating} из 5` : 'Нет оценок'}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Описание
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {property.description}
                        </Typography>

                        <Typography variant="h6" gutterBottom>
                            Расположение
                        </Typography>
                        <Typography variant="body1">
                            {property.address}, {property.city}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Боковая панель с ценой и формой бронирования */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h5" color="primary" gutterBottom>
                            {property.price_per_day} ₽
                            <Typography component="span" variant="subtitle1">
                                {' '}/ день
                            </Typography>
                        </Typography>

                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Статус: {property.status === 'active' ? 'Доступен' : 'Недоступен'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Добавлено: {new Date(property.created_at).toLocaleDateString()}
                        </Typography>

                        {property.status === 'active' && (
                            <BookingForm
                                property={property}
                                onSubmit={handleBookingSubmit}
                                loading={loading}
                                error={error}
                            />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}; 