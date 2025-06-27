-- Создание таблицы арендодателей в Supabase
CREATE TABLE landlords (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    avatar_url TEXT,
    verification_status TEXT NOT NULL CHECK (
        verification_status IN ('pending', 'verified', 'rejected')
    ) DEFAULT 'pending',
    rating NUMERIC(3, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    company_name TEXT,
    company_registration_number TEXT,
    tax_id TEXT,
    bank_account TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT,
    preferred_language TEXT NOT NULL DEFAULT 'ru',
    preferred_currency TEXT NOT NULL DEFAULT 'RUB',
    notification_settings JSONB NOT NULL DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb
);
-- Создание индексов для оптимизации поиска
CREATE INDEX idx_landlords_email ON landlords(email);
CREATE INDEX idx_landlords_verification_status ON landlords(verification_status);
CREATE INDEX idx_landlords_is_active ON landlords(is_active);
-- Создание функции для автоматического обновления поля updated_at
CREATE OR REPLACE FUNCTION update_landlord_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Создание триггера для автоматического обновления поля updated_at
CREATE TRIGGER trigger_update_landlord_updated_at BEFORE
UPDATE ON landlords FOR EACH ROW EXECUTE FUNCTION update_landlord_updated_at();
-- Создание политик доступа для RLS (Row Level Security)
-- Включаем RLS для таблицы
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
-- Политика для администраторов (полный доступ)
CREATE POLICY admin_all_access ON landlords FOR ALL TO authenticated USING (
    auth.uid() IN (
        SELECT id
        FROM auth.users
        WHERE auth.users.role = 'admin'
    )
);
-- Политика для чтения своей записи
CREATE POLICY read_own_landlord ON landlords FOR
SELECT TO authenticated USING (auth.uid() = id);
-- Политика для обновления своей записи
CREATE POLICY update_own_landlord ON landlords FOR
UPDATE TO authenticated USING (auth.uid() = id);
-- Комментарии к таблице и полям для документации
COMMENT ON TABLE landlords IS 'Таблица арендодателей платформы ShepsiGrad';
COMMENT ON COLUMN landlords.id IS 'Уникальный идентификатор арендодателя, соответствует ID пользователя в auth.users';
COMMENT ON COLUMN landlords.email IS 'Email арендодателя, используется для входа и коммуникации';
COMMENT ON COLUMN landlords.first_name IS 'Имя арендодателя';
COMMENT ON COLUMN landlords.last_name IS 'Фамилия арендодателя';
COMMENT ON COLUMN landlords.phone IS 'Контактный телефон арендодателя';
COMMENT ON COLUMN landlords.verification_status IS 'Статус верификации: pending (ожидает), verified (подтвержден), rejected (отклонен)';
COMMENT ON COLUMN landlords.rating IS 'Средний рейтинг арендодателя по отзывам';
COMMENT ON COLUMN landlords.is_active IS 'Активен ли аккаунт арендодателя';
COMMENT ON COLUMN landlords.notification_settings IS 'Настройки уведомлений в формате JSON';
-- Создание представления для публичного доступа к ограниченным данным арендодателей
CREATE VIEW public_landlords AS
SELECT id,
    first_name,
    last_name,
    avatar_url,
    verification_status,
    rating,
    is_active
FROM landlords
WHERE is_active = TRUE;