const axios = require('axios');
const jwt = require('jsonwebtoken');

// Конфигурация
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = 'test-secret-key';

// Тесты безопасности
async function runSecurityTests() {
  console.log('Запуск тестов безопасности API...');
  
  try {
    // 1. Тест доступа к защищенным маршрутам без токена
    await testUnauthorizedAccess();
    
    // 2. Тест с истекшим токеном
    await testExpiredToken();
    
    // 3. Тест с недействительным токеном
    await testInvalidToken();
    
    // 4. Тест на SQL инъекции
    await testSqlInjection();
    
    // 5. Тест на XSS уязвимости
    await testXssVulnerability();
    
    // 6. Тест на CSRF уязвимости
    await testCsrfVulnerability();
    
    // 7. Тест на Rate Limiting
    await testRateLimiting();
    
    console.log('\nВсе тесты безопасности завершены.');
  } catch (error) {
    console.error('Ошибка при выполнении тестов безопасности:', error);
  }
}

// 1. Тест доступа к защищенным маршрутам без токена
async function testUnauthorizedAccess() {
  console.log('\n1. Тест доступа к защищенным маршрутам без токена');
  
  try {
    const response = await axios.get(`${API_URL}/users/profile`);
    console.error('❌ УЯЗВИМОСТЬ: Доступ к защищенному маршруту без токена разрешен');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Доступ к защищенному маршруту без токена запрещен');
      return true;
    } else {
      console.error(`❌ Неожиданная ошибка: ${error.message}`);
      return false;
    }
  }
}

// 2. Тест с истекшим токеном
async function testExpiredToken() {
  console.log('\n2. Тест с истекшим токеном');
  
  // Создаем токен с истекшим сроком действия
  const expiredToken = jwt.sign(
    { id: 'test-user', exp: Math.floor(Date.now() / 1000) - 3600 },
    JWT_SECRET
  );
  
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${expiredToken}` }
    });
    console.error('❌ УЯЗВИМОСТЬ: Доступ с истекшим токеном разрешен');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Доступ с истекшим токеном запрещен');
      return true;
    } else {
      console.error(`❌ Неожиданная ошибка: ${error.message}`);
      return false;
    }
  }
}

// 3. Тест с недействительным токеном
async function testInvalidToken() {
  console.log('\n3. Тест с недействительным токеном');
  
  const invalidToken = 'invalid.token.string';
  
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${invalidToken}` }
    });
    console.error('❌ УЯЗВИМОСТЬ: Доступ с недействительным токеном разрешен');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✅ Доступ с недействительным токеном запрещен');
      return true;
    } else {
      console.error(`❌ Неожиданная ошибка: ${error.message}`);
      return false;
    }
  }
}

// 4. Тест на SQL инъекции
async function testSqlInjection() {
  console.log('\n4. Тест на SQL инъекции');
  
  const sqlInjectionPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE users; --",
    "' UNION SELECT * FROM users; --"
  ];
  
  let allPassed = true;
  
  for (const payload of sqlInjectionPayloads) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: payload,
        password: payload
      });
      
      if (response.data && response.data.token) {
        console.error(`❌ УЯЗВИМОСТЬ: SQL инъекция успешна с payload: ${payload}`);
        allPassed = false;
      } else {
        console.log(`✅ SQL инъекция не удалась с payload: ${payload}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`✅ SQL инъекция правильно обработана с payload: ${payload}`);
      } else {
        console.error(`❓ Неожиданная ошибка при тесте SQL инъекции: ${error.message}`);
      }
    }
  }
  
  return allPassed;
}

// 5. Тест на XSS уязвимости
async function testXssVulnerability() {
  console.log('\n5. Тест на XSS уязвимости');
  
  const xssPayload = '<script>alert("XSS")</script>';
  
  try {
    // Создаем валидный токен для авторизации
    const validToken = jwt.sign({ id: 'test-user' }, JWT_SECRET);
    
    // Отправляем XSS payload в поле сообщения
    const response = await axios.post(
      `${API_URL}/chat/messages`,
      { message: xssPayload, recipientId: 'test-recipient' },
      { headers: { Authorization: `Bearer ${validToken}` } }
    );
    
    // Проверяем, был ли payload экранирован в ответе
    if (response.data && response.data.message === xssPayload) {
      console.error('❌ УЯЗВИМОСТЬ: XSS payload не был экранирован');
      return false;
    } else {
      console.log('✅ XSS payload был правильно обработан');
      return true;
    }
  } catch (error) {
    console.log(`✅ API отклонил XSS payload: ${error.message}`);
    return true;
  }
}

// 6. Тест на CSRF уязвимости
async function testCsrfVulnerability() {
  console.log('\n6. Тест на CSRF уязвимости');
  
  try {
    // Создаем валидный токен для авторизации
    const validToken = jwt.sign({ id: 'test-user' }, JWT_SECRET);
    
    // Отправляем запрос без CSRF токена
    const response = await axios.post(
      `${API_URL}/users/update-profile`,
      { name: 'Hacked Name' },
      { 
        headers: { 
          Authorization: `Bearer ${validToken}`,
          'Origin': 'https://malicious-site.com'
        } 
      }
    );
    
    console.error('❌ УЯЗВИМОСТЬ: Запрос с другого источника без CSRF токена принят');
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      console.log('✅ CSRF защита работает корректно');
      return true;
    } else {
      console.log(`❓ Неожиданная ошибка при тесте CSRF: ${error.message}`);
      return false;
    }
  }
}

// 7. Тест на Rate Limiting
async function testRateLimiting() {
  console.log('\n7. Тест на Rate Limiting');
  
  const requests = [];
  const requestCount = 50;
  let failedRequests = 0;
  
  console.log(`Отправка ${requestCount} запросов для проверки ограничения скорости...`);
  
  for (let i = 0; i < requestCount; i++) {
    requests.push(
      axios.post(`${API_URL}/auth/login`, {
        email: `test${i}@example.com`,
        password: 'password123'
      }).catch(error => {
        if (error.response && error.response.status === 429) {
          failedRequests++;
        }
      })
    );
  }
  
  await Promise.all(requests);
  
  if (failedRequests > 0) {
    console.log(`✅ Rate Limiting работает: ${failedRequests} запросов были отклонены`);
    return true;
  } else {
    console.error('❌ УЯЗВИМОСТЬ: Rate Limiting не работает');
    return false;
  }
}

// Запуск тестов
runSecurityTests(); 