-- Добавление полей payment_id и refund_id в таблицу bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
-- Проверка существования типа booking_status
DO $$ BEGIN -- Проверяем существование типа booking_status
IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'booking_status'
) THEN -- Проверяем, есть ли уже значение 'refunded' в enum
IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status'
        AND e.enumlabel = 'refunded'
) THEN -- Добавляем значение 'refunded' в enum
ALTER TYPE booking_status
ADD VALUE 'refunded';
END IF;
ELSE -- Если тип не существует, создаем его с базовыми статусами
CREATE TYPE booking_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'completed',
    'refunded'
);
-- Если есть таблица bookings и колонка status, конвертируем ее в новый тип
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings'
        AND column_name = 'status'
) THEN -- Сначала удаляем значение по умолчанию, если оно есть
ALTER TABLE bookings
ALTER COLUMN status DROP DEFAULT;
-- Конвертируем колонку в VARCHAR, затем в новый тип
ALTER TABLE bookings
ALTER COLUMN status TYPE VARCHAR(255);
-- Обновляем все NULL значения на 'pending'
UPDATE bookings
SET status = 'pending'
WHERE status IS NULL;
-- Преобразуем в тип enum
ALTER TABLE bookings
ALTER COLUMN status TYPE booking_status USING status::booking_status;
-- Устанавливаем значение по умолчанию
ALTER TABLE bookings
ALTER COLUMN status
SET DEFAULT 'pending'::booking_status;
END IF;
END IF;
END $$;