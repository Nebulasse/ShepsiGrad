const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const { URL } = require('url');

// Конфигурация
const BASE_URL = 'http://localhost:3000';
const USER_FLOWS = [
  {
    name: 'Регистрация пользователя',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'click', selector: 'a[href*="register"]' },
      { action: 'type', selector: 'input[name="email"]', value: 'test@example.com' },
      { action: 'type', selector: 'input[name="password"]', value: 'Password123!' },
      { action: 'type', selector: 'input[name="confirmPassword"]', value: 'Password123!' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'waitForNavigation' }
    ]
  },
  {
    name: 'Поиск объектов недвижимости',
    steps: [
      { action: 'navigate', url: '/' },
      { action: 'type', selector: 'input[placeholder*="Поиск"]', value: 'Москва' },
      { action: 'click', selector: 'button[type="submit"]' },
      { action: 'waitForSelector', selector: '.property-card' }
    ]
  },
  {
    name: 'Просмотр деталей объекта',
    steps: [
      { action: 'navigate', url: '/properties' },
      { action: 'waitForSelector', selector: '.property-card' },
      { action: 'click', selector: '.property-card:first-child' },
      { action: 'waitForSelector', selector: '.property-details' }
    ]
  }
];

// Основная функция для тестирования UX
async function testUserExperience() {
  console.log('Запуск тестирования пользовательского опыта...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Тестирование пользовательских сценариев
    await testUserFlows(browser);
    
    // Тестирование производительности с Lighthouse
    await testPerformance(browser);
    
    // Тестирование доступности с Lighthouse
    await testAccessibility(browser);
    
  } catch (error) {
    console.error('Ошибка при тестировании UX:', error);
  } finally {
    await browser.close();
  }
}

// Тестирование пользовательских сценариев
async function testUserFlows(browser) {
  console.log('\n--- Тестирование пользовательских сценариев ---');
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Включаем перехват консольных сообщений
  page.on('console', message => {
    if (message.type() === 'error') {
      console.error(`Ошибка в консоли: ${message.text()}`);
    }
  });
  
  // Включаем перехват ошибок сети
  page.on('pageerror', error => {
    console.error(`Ошибка страницы: ${error.message}`);
  });
  
  for (const flow of USER_FLOWS) {
    console.log(`\nТестирование сценария: ${flow.name}`);
    
    try {
      // Выполняем шаги сценария
      for (const step of flow.steps) {
        switch (step.action) {
          case 'navigate':
            console.log(`- Переход на страницу: ${step.url}`);
            await page.goto(`${BASE_URL}${step.url}`, { waitUntil: 'networkidle2' });
            break;
            
          case 'click':
            console.log(`- Клик по элементу: ${step.selector}`);
            await page.waitForSelector(step.selector, { visible: true });
            await page.click(step.selector);
            break;
            
          case 'type':
            console.log(`- Ввод текста в поле: ${step.selector}`);
            await page.waitForSelector(step.selector, { visible: true });
            await page.type(step.selector, step.value);
            break;
            
          case 'waitForNavigation':
            console.log('- Ожидание перехода на новую страницу');
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
            break;
            
          case 'waitForSelector':
            console.log(`- Ожидание появления элемента: ${step.selector}`);
            await page.waitForSelector(step.selector, { visible: true, timeout: 5000 });
            break;
        }
        
        // Пауза между шагами для визуального контроля
        await page.waitForTimeout(500);
      }
      
      console.log(`✅ Сценарий "${flow.name}" выполнен успешно`);
    } catch (error) {
      console.error(`❌ Ошибка в сценарии "${flow.name}": ${error.message}`);
      
      // Сохраняем скриншот места ошибки
      const screenshotPath = `error-${flow.name.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: screenshotPath });
      console.error(`   Скриншот сохранен: ${screenshotPath}`);
    }
  }
}

// Тестирование производительности с Lighthouse
async function testPerformance(browser) {
  console.log('\n--- Тестирование производительности с Lighthouse ---');
  
  const page = await browser.newPage();
  
  const options = {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'json',
    onlyCategories: ['performance']
  };
  
  try {
    const result = await lighthouse(BASE_URL, options);
    const report = result.lhr;
    
    console.log(`Общая оценка производительности: ${report.categories.performance.score * 100}/100`);
    
    // Вывод основных метрик
    const metrics = [
      { name: 'First Contentful Paint (FCP)', key: 'first-contentful-paint' },
      { name: 'Largest Contentful Paint (LCP)', key: 'largest-contentful-paint' },
      { name: 'Cumulative Layout Shift (CLS)', key: 'cumulative-layout-shift' },
      { name: 'Total Blocking Time (TBT)', key: 'total-blocking-time' },
      { name: 'Speed Index', key: 'speed-index' }
    ];
    
    for (const metric of metrics) {
      const auditResult = report.audits[metric.key];
      console.log(`${metric.name}: ${auditResult.displayValue} (оценка: ${auditResult.score * 100}/100)`);
    }
    
    // Выявление проблем
    const issues = Object.values(report.audits)
      .filter(audit => audit.score !== null && audit.score < 0.9)
      .sort((a, b) => a.score - b.score);
    
    if (issues.length > 0) {
      console.log('\nВыявленные проблемы производительности:');
      issues.slice(0, 5).forEach(issue => {
        console.log(`- ${issue.title}: ${issue.displayValue || 'Нет данных'} (оценка: ${issue.score * 100}/100)`);
      });
    }
  } catch (error) {
    console.error('Ошибка при тестировании производительности:', error);
  }
}

// Тестирование доступности с Lighthouse
async function testAccessibility(browser) {
  console.log('\n--- Тестирование доступности с Lighthouse ---');
  
  const page = await browser.newPage();
  
  const options = {
    port: (new URL(browser.wsEndpoint())).port,
    output: 'json',
    onlyCategories: ['accessibility']
  };
  
  try {
    const result = await lighthouse(BASE_URL, options);
    const report = result.lhr;
    
    console.log(`Общая оценка доступности: ${report.categories.accessibility.score * 100}/100`);
    
    // Выявление проблем доступности
    const accessibilityIssues = Object.values(report.audits)
      .filter(audit => 
        audit.group === 'a11y-color-contrast' || 
        audit.group === 'a11y-names-labels' || 
        audit.group === 'a11y-navigation'
      )
      .filter(audit => audit.score !== null && audit.score < 1);
    
    if (accessibilityIssues.length > 0) {
      console.log('\nВыявленные проблемы доступности:');
      accessibilityIssues.forEach(issue => {
        console.log(`- ${issue.title}`);
        if (issue.details && issue.details.items) {
          console.log(`  Затронутые элементы: ${issue.details.items.length}`);
        }
      });
    } else {
      console.log('Проблем с доступностью не выявлено.');
    }
  } catch (error) {
    console.error('Ошибка при тестировании доступности:', error);
  }
}

// Запуск тестов
testUserExperience().catch(console.error); 