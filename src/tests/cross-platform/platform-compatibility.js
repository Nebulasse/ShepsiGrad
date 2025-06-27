const axios = require('axios');
const { JSDOM } = require('jsdom');
const userAgents = require('./user-agents.json');

// Конфигурация
const TEST_URL = 'http://localhost:3000';
const API_ENDPOINTS = [
  '/api/properties',
  '/api/auth/login',
  '/api/users/profile'
];

// Функция для проверки совместимости с разными устройствами
async function testPlatformCompatibility() {
  console.log('Запуск кросс-платформенного тестирования...');
  
  const results = {
    desktop: { passed: 0, failed: 0, details: [] },
    mobile: { passed: 0, failed: 0, details: [] },
    tablet: { passed: 0, failed: 0, details: [] }
  };
  
  // Тестирование для каждого User-Agent
  for (const [platform, agents] of Object.entries(userAgents)) {
    console.log(`\nТестирование для платформы: ${platform}`);
    
    for (const agent of agents) {
      console.log(`\n- Тестирование с User-Agent: ${agent.name}`);
      
      try {
        // Проверка доступности основной страницы
        const webResult = await testWebAccess(agent.value);
        
        // Проверка API endpoints
        const apiResults = await testApiEndpoints(agent.value);
        
        // Обновление результатов
        if (webResult.success) {
          results[platform].passed++;
        } else {
          results[platform].failed++;
        }
        
        results[platform].details.push({
          userAgent: agent.name,
          webAccess: webResult,
          apiResults
        });
        
      } catch (error) {
        console.error(`Ошибка при тестировании ${agent.name}: ${error.message}`);
        results[platform].failed++;
        results[platform].details.push({
          userAgent: agent.name,
          error: error.message
        });
      }
    }
  }
  
  // Вывод сводки результатов
  console.log('\n--- Результаты кросс-платформенного тестирования ---');
  for (const [platform, result] of Object.entries(results)) {
    const total = result.passed + result.failed;
    const passRate = total > 0 ? (result.passed / total * 100).toFixed(2) : 0;
    
    console.log(`${platform}: ${result.passed}/${total} тестов пройдено (${passRate}%)`);
    
    // Вывод деталей по неудачным тестам
    const failures = result.details.filter(d => d.error || !d.webAccess.success);
    if (failures.length > 0) {
      console.log(`  Неудачные тесты для ${platform}:`);
      failures.forEach(failure => {
        console.log(`  - ${failure.userAgent}: ${failure.error || failure.webAccess.error}`);
      });
    }
  }
}

// Проверка доступа к веб-интерфейсу
async function testWebAccess(userAgent) {
  try {
    const response = await axios.get(TEST_URL, {
      headers: { 'User-Agent': userAgent }
    });
    
    // Проверка статуса ответа
    if (response.status !== 200) {
      return {
        success: false,
        error: `Неверный статус ответа: ${response.status}`
      };
    }
    
    // Проверка содержимого страницы
    const dom = new JSDOM(response.data);
    const document = dom.window.document;
    
    // Проверка наличия основных элементов
    const hasHeader = !!document.querySelector('header');
    const hasFooter = !!document.querySelector('footer');
    const hasMainContent = !!document.querySelector('main') || !!document.querySelector('#root');
    
    if (!hasHeader || !hasFooter || !hasMainContent) {
      return {
        success: false,
        error: 'Отсутствуют основные элементы страницы'
      };
    }
    
    return {
      success: true,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Проверка доступа к API
async function testApiEndpoints(userAgent) {
  const results = [];
  
  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await axios.get(`${TEST_URL}${endpoint}`, {
        headers: { 'User-Agent': userAgent },
        validateStatus: () => true // Принимаем любой статус ответа
      });
      
      results.push({
        endpoint,
        status: response.status,
        success: response.status < 500 // Считаем успешным, если нет серверной ошибки
      });
    } catch (error) {
      results.push({
        endpoint,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Запуск тестов
testPlatformCompatibility().catch(console.error); 