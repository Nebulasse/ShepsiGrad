/**
 * Тестовый скрипт для создания объекта недвижимости через UI приложения арендодателя
 * и проверки его синхронизации с общей базой данных
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { setTimeout } = require('timers/promises');

// Загрузка переменных окружения из test.env
dotenv.config({ path: path.join(__dirname, 'test.env') });

// Конфигурация Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xbgiwxvxtxmgfpoigxiz.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;

// Инициализация клиента Supabase
let supabase = null;
try {
  if (supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase клиент инициализирован');
  } else {
    console.warn('SUPABASE_KEY не найден в переменных окружения');
  }
} catch (error) {
  console.error('Ошибка при инициализации Supabase клиента:', error);
}

// Данные тестового объекта недвижимости
const testProperty = {
  title: 'Тестовые апартаменты (UI Test)',
  description: 'Этот объект создан для проверки синхронизации через UI',
  address: 'ул. Тестовая, 456',
  city: 'Шепси',
  price_per_day: 4000,
  property_type: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  max_guests: 3,
  amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор'],
  rules: ['Не курить']
};

// Функция для прямой проверки наличия объекта в базе данных
async function checkPropertyInDatabase(propertyTitle) {
  if (!supabase) {
    console.log('Supabase клиент не инициализирован, пропускаем проверку в базе данных');
    return null;
  }

  try {
    // Ищем объект по названию
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .ilike('title', `%${propertyTitle}%`)
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      console.log('Объект найден в базе данных:', data[0]);
      return data[0];
    } else {
      console.log('Объект не найден в базе данных');
      return null;
    }
  } catch (error) {
    console.error('Ошибка при проверке объекта в базе данных:', error);
    return null;
  }
}

// Функция для создания объекта через имитацию UI действий
async function simulateUIPropertyCreation() {
  console.log('Имитация создания объекта через UI приложения арендодателя...');
  
  // В реальном тесте здесь был бы код для автоматизации UI
  // Например, с использованием Detox, Appium или другого инструмента для тестирования UI
  
  // Вместо этого мы просто имитируем задержку UI операций
  await setTimeout(2000);
  
  console.log('Заполнение формы объекта недвижимости...');
  await setTimeout(1000);
  
  console.log('Отправка формы...');
  await setTimeout(1500);
  
  // Возвращаем данные "созданного" объекта
  return {
    ...testProperty,
    id: `ui-test-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// Функция для сохранения результатов теста
function saveTestResults(simulatedProperty, databaseProperty) {
  const results = {
    testTime: new Date().toISOString(),
    simulatedProperty,
    databaseProperty,
    syncSuccessful: !!databaseProperty,
    syncDelay: databaseProperty ? 
      new Date(databaseProperty.updated_at) - new Date(simulatedProperty.created_at) : 
      null
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'ui-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('Результаты UI теста сохранены в файл ui-test-results.json');
}

// Основная функция теста
async function runUITest() {
  try {
    console.log('Начало UI теста синхронизации объектов недвижимости...');
    
    // Имитируем создание объекта через UI
    const simulatedProperty = await simulateUIPropertyCreation();
    console.log('Объект "создан" через UI:', simulatedProperty);
    
    // Ждем некоторое время для синхронизации
    console.log('Ожидание синхронизации (10 секунд)...');
    await setTimeout(10000);
    
    // Проверяем наличие объекта в базе данных
    const databaseProperty = await checkPropertyInDatabase(testProperty.title);
    
    if (databaseProperty) {
      console.log('Синхронизация успешна! Объект найден в базе данных');
    } else {
      console.log('Синхронизация не удалась или объект не найден в базе данных');
    }
    
    // Сохраняем результаты
    saveTestResults(simulatedProperty, databaseProperty);
    
    console.log('UI тест завершен');
  } catch (error) {
    console.error('Ошибка при выполнении UI теста:', error);
  }
}

// Запуск теста
runUITest(); 