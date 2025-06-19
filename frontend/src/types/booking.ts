export interface Booking {
    id: string;
    property_id: string;
    user_id: string;
    check_in_date: string;
    check_out_date: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    guests_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateBookingData {
    property_id: string;
    check_in_date: string;
    check_out_date: string;
    guests_count: number;
}

export interface BookingFilters {
    status?: Booking['status'];
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
} 