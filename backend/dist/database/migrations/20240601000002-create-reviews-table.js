"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
const supabase_1 = require("../../config/supabase");
/**
 * Миграция для создания таблицы отзывов
 */
async function up() {
    // Создаем таблицу отзывов
    const { error: tableError } = await supabase_1.supabase.rpc('create_reviews_table');
    if (tableError) {
        console.error('Error creating reviews table:', tableError);
        throw tableError;
    }
    // Создаем функцию для расчета среднего рейтинга
    const { error: functionError } = await supabase_1.supabase.rpc('create_average_rating_function');
    if (functionError) {
        console.error('Error creating average rating function:', functionError);
        throw functionError;
    }
    console.log('Reviews table and functions created successfully');
}
/**
 * Откат миграции
 */
async function down() {
    // Удаляем функцию расчета среднего рейтинга
    const { error: functionError } = await supabase_1.supabase.rpc('drop_average_rating_function');
    if (functionError) {
        console.error('Error dropping average rating function:', functionError);
        throw functionError;
    }
    // Удаляем таблицу отзывов
    const { error: tableError } = await supabase_1.supabase.rpc('drop_reviews_table');
    if (tableError) {
        console.error('Error dropping reviews table:', tableError);
        throw tableError;
    }
    console.log('Reviews table and functions dropped successfully');
}
/**
 * SQL для создания таблицы отзывов и функций
 * Этот SQL будет выполнен на стороне Supabase через RPC
 */
/*
-- Создание таблицы отзывов
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  landlord_reply TEXT,
  landlord_reply_at TIMESTAMP WITH TIME ZONE,
  is_hidden BOOLEAN DEFAULT FALSE
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- Функция для расчета среднего рейтинга объекта
CREATE OR REPLACE FUNCTION public.get_average_rating(property_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating)::NUMERIC(3,2)
  INTO avg_rating
  FROM public.reviews
  WHERE property_id = property_id_param AND is_hidden = FALSE;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql;
*/ 
