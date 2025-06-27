const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие переменных окружения для Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase');
  console.error('Убедитесь, что в файле .env определены SUPABASE_URL и SUPABASE_ANON_KEY');
  process.exit(1);
}

// Выводим информацию о подключении (без секретного ключа)
console.log('Используемые параметры подключения к Supabase:');
console.log(`- URL: ${supabaseUrl}`);
console.log(`- Ключ: ${supabaseKey.substring(0, 5)}...${supabaseKey.substring(supabaseKey.length - 5)}`);

// Создаем клиент Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('\nТестирование подключения к Supabase...');
  
  try {
    // Простой запрос для проверки подключения
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Подключение к Supabase установлено успешно');
    console.log(`Найдено пользователей: ${data.length}`);
    
    // Проверяем таблицу properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .limit(5);
    
    if (propertiesError) {
      console.log('⚠️ Ошибка при запросе к таблице properties:', propertiesError.message);
    } else {
      console.log(`\n📋 Найдено объектов недвижимости: ${properties.length}`);
      
      if (properties.length > 0) {
        console.log('Список объектов:');
        properties.forEach((property, index) => {
          console.log(`${index + 1}. ${property.title || 'Без названия'} (ID: ${property.id})`);
        });
      }
    }
    
    // Проверяем таблицу bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, property_id, user_id, status')
      .limit(5);
    
    if (bookingsError) {
      console.log('⚠️ Ошибка при запросе к таблице bookings:', bookingsError.message);
    } else {
      console.log(`\n📋 Найдено бронирований: ${bookings.length}`);
      
      if (bookings.length > 0) {
        console.log('Список бронирований:');
        bookings.forEach((booking, index) => {
          console.log(`${index + 1}. Бронирование ID: ${booking.id}, Статус: ${booking.status || 'Не указан'}`);
        });
      }
    }
    
  } catch (err) {
    console.error('❌ Ошибка при подключении к Supabase:', err.message);
    
    if (err.message && err.message.includes('JWT')) {
      console.error('Проверьте правильность ключа SUPABASE_ANON_KEY в файле .env');
    } else if (err.message && err.message.includes('fetch')) {
      console.error('Проверьте правильность URL SUPABASE_URL в файле .env и доступность интернет-соединения');
    } else {
      console.error('Полная информация об ошибке:', err);
    }
  }
}

// Запускаем тест
testSupabaseConnection(); 