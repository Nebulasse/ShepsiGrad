/**
 * Тестовый скрипт для проверки создания объекта недвижимости и его синхронизации
 * между приложением арендодателя и общей базой данных
 */

const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения из test.env
dotenv.config({ path: path.join(__dirname, 'test.env') });

// Конфигурация API
const API_URL = process.env.API_URL || 'http://192.168.1.100:3000';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

// Создаваемый объект недвижимости
const newProperty = {
  title: 'Тестовые апартаменты для проверки синхронизации',
  description: 'Этот объект создан для проверки синхронизации между приложениями',
  address: 'ул. Тестовая, 123',
  city: 'Шепси',
  price_per_day: 3500,
  property_type: 'apartment',
  bedrooms: 2,
  bathrooms: 1,
  max_guests: 4,
  amenities: ['Wi-Fi', 'Кондиционер', 'Телевизор', 'Кухня'],
  rules: ['Не курить', 'Без животных'],
  status: 'active'
};

// Функция для авторизации
async function login() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password',
      role: 'landlord'
    });
    
    return response.data.token;
  } catch (error) {
    console.error('Ошибка при авторизации:', error.response?.data || error.message);
    throw error;
  }
}

// Функция для создания объекта недвижимости
async function createProperty(token) {
  try {
    const response = await axios.post(`${API_URL}/api/properties`, newProperty, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Объект недвижимости успешно создан:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании объекта:', error.response?.data || error.message);
    throw error;
  }
}

// Функция для проверки наличия объекта в общей базе данных
async function checkPropertyInMainApp(propertyId, token) {
  try {
    // Запрос к API приложения съемщика
    const response = await axios.get(`${API_URL}/api/properties/${propertyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-App-Type': 'tenant' // Указываем, что запрос от приложения съемщика
      }
    });
    
    console.log('Объект найден в общей базе данных:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при проверке объекта в общей базе:', error.response?.data || error.message);
    throw error;
  }
}

// Функция для сохранения результатов теста
function saveTestResults(created, synced) {
  const results = {
    testTime: new Date().toISOString(),
    propertyCreated: created,
    propertySynced: synced,
    syncDelay: synced ? new Date(synced.updated_at) - new Date(created.created_at) : null
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'sync-test-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  console.log('Результаты теста сохранены в файл sync-test-results.json');
}

// Основная функция теста
async function runTest() {
  try {
    console.log('Начало теста синхронизации объектов недвижимости...');
    
    // Получаем токен авторизации
    const token = process.env.TEST_AUTH_TOKEN || await login();
    console.log('Авторизация успешна');
    
    // Создаем объект недвижимости
    const createdProperty = await createProperty(token);
    console.log(`Создан объект с ID: ${createdProperty.id}`);
    
    // Ждем некоторое время для синхронизации
    console.log('Ожидание синхронизации (5 секунд)...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Проверяем наличие объекта в общей базе данных
    const syncedProperty = await checkPropertyInMainApp(createdProperty.id, token);
    
    // Сравниваем данные
    const isSync = JSON.stringify(createdProperty) === JSON.stringify(syncedProperty);
    console.log(`Синхронизация ${isSync ? 'успешна' : 'не удалась'}`);
    
    // Сохраняем результаты
    saveTestResults(createdProperty, syncedProperty);
    
    console.log('Тест завершен');
  } catch (error) {
    console.error('Ошибка при выполнении теста:', error);
  }
}

// Запуск теста
runTest(); 