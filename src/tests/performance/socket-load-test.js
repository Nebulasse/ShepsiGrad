const { io } = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Конфигурация теста
const TEST_CONFIG = {
  connections: 100,           // Количество одновременных соединений
  messageRate: 10,            // Сообщений в секунду от каждого клиента
  testDuration: 30,           // Продолжительность теста в секундах
  serverUrl: 'http://localhost:3000',
  jwtSecret: 'test-secret-key'
};

// Статистика
const stats = {
  connectionsAttempted: 0,
  connectionsSuccessful: 0,
  connectionsFailed: 0,
  messagesSent: 0,
  messagesReceived: 0,
  errors: 0,
  latencies: []
};

// Создание JWT токена
function createToken(userId) {
  return jwt.sign({ id: userId }, TEST_CONFIG.jwtSecret);
}

// Создание клиентов
async function createClients() {
  const clients = [];
  console.log(`Создание ${TEST_CONFIG.connections} соединений...`);
  
  for (let i = 0; i < TEST_CONFIG.connections; i++) {
    try {
      stats.connectionsAttempted++;
      const userId = `test-user-${i}`;
      const token = createToken(userId);
      
      const socket = io(TEST_CONFIG.serverUrl, {
        auth: {
          token,
          appType: i % 2 === 0 ? 'tenant' : 'landlord'
        },
        transports: ['websocket'],
        reconnection: false
      });
      
      // Обработчики событий
      socket.on('connect', () => {
        stats.connectionsSuccessful++;
      });
      
      socket.on('connect_error', (err) => {
        stats.connectionsFailed++;
        stats.errors++;
        console.error(`Ошибка соединения для клиента ${i}: ${err.message}`);
      });
      
      socket.on('private_message', (data) => {
        stats.messagesReceived++;
        const latency = Date.now() - new Date(data.timestamp).getTime();
        stats.latencies.push(latency);
      });
      
      clients.push({ socket, userId });
    } catch (error) {
      stats.connectionsFailed++;
      stats.errors++;
      console.error(`Ошибка при создании клиента ${i}: ${error.message}`);
    }
  }
  
  return clients;
}

// Отправка сообщений
function sendMessages(clients) {
  const interval = 1000 / TEST_CONFIG.messageRate;
  let messageCount = 0;
  
  console.log(`Отправка сообщений с интервалом ${interval}ms...`);
  
  const intervalId = setInterval(() => {
    // Выбираем случайного отправителя и получателя
    const senderIndex = Math.floor(Math.random() * clients.length);
    let receiverIndex;
    do {
      receiverIndex = Math.floor(Math.random() * clients.length);
    } while (receiverIndex === senderIndex);
    
    const sender = clients[senderIndex];
    const receiver = clients[receiverIndex];
    
    if (sender.socket.connected) {
      try {
        sender.socket.emit('private_message', {
          to: receiver.userId,
          message: `Test message ${messageCount}`,
          timestamp: new Date()
        });
        stats.messagesSent++;
        messageCount++;
      } catch (error) {
        stats.errors++;
      }
    }
  }, interval);
  
  return intervalId;
}

// Вывод статистики
function printStats() {
  console.log('\n--- Статистика нагрузочного тестирования ---');
  console.log(`Попытки соединений: ${stats.connectionsAttempted}`);
  console.log(`Успешные соединения: ${stats.connectionsSuccessful}`);
  console.log(`Неудачные соединения: ${stats.connectionsFailed}`);
  console.log(`Отправлено сообщений: ${stats.messagesSent}`);
  console.log(`Получено сообщений: ${stats.messagesReceived}`);
  console.log(`Ошибки: ${stats.errors}`);
  
  if (stats.latencies.length > 0) {
    const avgLatency = stats.latencies.reduce((sum, val) => sum + val, 0) / stats.latencies.length;
    const maxLatency = Math.max(...stats.latencies);
    const minLatency = Math.min(...stats.latencies);
    
    console.log(`Задержка (мин/средн/макс): ${minLatency}ms / ${avgLatency.toFixed(2)}ms / ${maxLatency}ms`);
  }
}

// Основная функция теста
async function runLoadTest() {
  console.log(`Запуск нагрузочного тестирования WebSocket...`);
  console.log(`Конфигурация: ${TEST_CONFIG.connections} соединений, ${TEST_CONFIG.messageRate} сообщений/сек, ${TEST_CONFIG.testDuration} секунд`);
  
  const startTime = Date.now();
  const clients = await createClients();
  
  // Ждем установки соединений
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const messageInterval = sendMessages(clients);
  
  // Завершение теста по истечении времени
  setTimeout(() => {
    clearInterval(messageInterval);
    
    // Закрываем все соединения
    clients.forEach(client => {
      if (client.socket.connected) {
        client.socket.disconnect();
      }
    });
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\nТест завершен за ${duration.toFixed(2)} секунд`);
    printStats();
    
    process.exit(0);
  }, TEST_CONFIG.testDuration * 1000);
}

// Запуск теста
runLoadTest().catch(error => {
  console.error('Ошибка при выполнении теста:', error);
  process.exit(1);
}); 