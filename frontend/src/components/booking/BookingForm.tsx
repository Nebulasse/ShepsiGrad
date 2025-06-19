import React, { useState } from 'react';
import {
    Paper,
    Typography,
    Box,
    TextField,
    Button,
    Grid,
    Alert,
    CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { Property } from '../../types/property';
import { CreateBookingData } from '../../types/booking';

interface BookingFormProps {
    property: Property;
    onSubmit: (data: CreateBookingData) => Promise<void>;
    loading?: boolean;
    error?: string | null;
}

export const BookingForm: React.FC<BookingFormProps> = ({
    property,
    onSubmit,
    loading = false,
    error = null
}) => {
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [guestsCount, setGuestsCount] = useState<number>(1);

    const calculateTotalPrice = () => {
        if (!checkInDate || !checkOutDate) return 0;
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return days * property.price_per_day;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkInDate || !checkOutDate) return;

        await onSubmit({
            property_id: property.id,
            check_in_date: checkInDate.toISOString(),
            check_out_date: checkOutDate.toISOString(),
            guests_count: guestsCount
        });
    };

    const isFormValid = checkInDate && checkOutDate && guestsCount > 0 && guestsCount <= property.max_guests;

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Забронировать
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="Дата заезда"
                                value={checkInDate}
                                onChange={(newValue) => setCheckInDate(newValue)}
                                minDate={new Date()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                            <DatePicker
                                label="Дата выезда"
                                value={checkOutDate}
                                onChange={(newValue) => setCheckOutDate(newValue)}
                                minDate={checkInDate || new Date()}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        required: true
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Количество гостей"
                            value={guestsCount}
                            onChange={(e) => setGuestsCount(Number(e.target.value))}
                            inputProps={{
                                min: 1,
                                max: property.max_guests
                            }}
                            required
                        />
                    </Grid>

                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Итого:
                            </Typography>
                            <Typography variant="h5" color="primary">
                                {calculateTotalPrice()} ₽
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={!isFormValid || loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Забронировать'
                            )}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}; 