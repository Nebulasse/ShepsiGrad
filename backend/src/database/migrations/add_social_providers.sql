-- Добавление поля social_providers
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS social_providers JSONB [] DEFAULT '{}';
-- Добавление поля avatar
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar TEXT;
-- Создаем индекс для поиска по social_providers
CREATE INDEX IF NOT EXISTS idx_users_social_providers ON public.users USING GIN (social_providers);
-- Комментарии к новым полям
COMMENT ON COLUMN public.users.social_providers IS 'Массив объектов с информацией о социальных провайдерах';
COMMENT ON COLUMN public.users.avatar IS 'URL аватара пользователя';
-- Обновляем политики безопасности, чтобы новые поля были доступны
CREATE OR REPLACE POLICY "Пользователи могут читать свои данные" ON public.users FOR
SELECT USING (auth.uid() = id);
CREATE OR REPLACE POLICY "Пользователи могут обновлять свои данные" ON public.users FOR
UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);