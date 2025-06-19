import { useState } from 'react';
import { CreateBookingData, Booking } from '../types/booking';
import { api } from '../services/api';

export const useBooking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBooking = async (data: CreateBookingData): Promise<Booking | null> => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.post('/bookings', data);
            return response.data;
        } catch (err) {
            setError('Ошибка при создании бронирования');
            console.error('Error creating booking:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            await api.post(`/bookings/${bookingId}/cancel`);
            return true;
        } catch (err) {
            setError('Ошибка при отмене бронирования');
            console.error('Error cancelling booking:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createBooking,
        cancelBooking
    };
}; 