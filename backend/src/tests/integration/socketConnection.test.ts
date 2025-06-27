import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { SocketService } from '../../services/socketService';
import jwt from 'jsonwebtoken';

// Mock для UserModel
jest.mock('../../models/User', () => ({
  UserModel: {
    findById: jest.fn().mockImplementation((id) => {
      if (id === 'tenant-user-id') {
        return Promise.resolve({ id: 'tenant-user-id', email: 'tenant@example.com' });
      } else if (id === 'landlord-user-id') {
        return Promise.resolve({ id: 'landlord-user-id', email: 'landlord@example.com' });
      }
      return Promise.resolve(null);
    })
  }
}));

// Mock для LoggerService
jest.mock('../../services/loggerService', () => ({
  LoggerService: {
    info: jest.fn(),
    error: jest.fn()
  }
}));

describe('WebSocket Connection Tests', () => {
  let httpServer;
  let socketService;
  let tenantClient;
  let landlordClient;
  let tenantToken;
  let landlordToken;
  
  beforeAll(() => {
    // Создаем JWT токены для тестов
    const jwtSecret = 'test-secret-key';
    process.env.JWT_SECRET = jwtSecret;
    
    tenantToken = jwt.sign({ id: 'tenant-user-id' }, jwtSecret);
    landlordToken = jwt.sign({ id: 'landlord-user-id' }, jwtSecret);
  });
  
  beforeEach((done) => {
    // Создаем HTTP сервер для тестов
    httpServer = createServer();
    socketService = new SocketService(httpServer);
    
    // Запускаем сервер на случайном порту
    httpServer.listen(() => {
      const port = httpServer.address().port;
      
      // Создаем клиентские соединения
      tenantClient = Client(`http://localhost:${port}`, {
        auth: {
          token: tenantToken,
          appType: 'tenant'
        }
      });
      
      landlordClient = Client(`http://localhost:${port}`, {
        auth: {
          token: landlordToken,
          appType: 'landlord'
        }
      });
      
      // Ждем подключения обоих клиентов
      let connectedClients = 0;
      const onConnect = () => {
        connectedClients++;
        if (connectedClients === 2) {
          done();
        }
      };
      
      tenantClient.on('connect', onConnect);
      landlordClient.on('connect', onConnect);
    });
  });
  
  afterEach(() => {
    // Закрываем соединения после каждого теста
    tenantClient.disconnect();
    landlordClient.disconnect();
    httpServer.close();
  });
  
  test('должен подключать клиентов с разными типами приложений', async () => {
    const connectedUsers = socketService.getConnectedUsers();
    
    // Проверяем, что оба пользователя подключены
    expect(connectedUsers.length).toBe(2);
    
    // Проверяем, что у пользователей правильные типы приложений
    const tenantUser = connectedUsers.find(user => user.userId === 'tenant-user-id');
    const landlordUser = connectedUsers.find(user => user.userId === 'landlord-user-id');
    
    expect(tenantUser).toBeDefined();
    expect(tenantUser.appType).toBe('tenant');
    
    expect(landlordUser).toBeDefined();
    expect(landlordUser.appType).toBe('landlord');
  });
  
  test('должен отправлять и получать личные сообщения между приложениями', (done) => {
    const testMessage = 'Тестовое сообщение между приложениями';
    
    // Настраиваем обработчик для получения сообщения
    landlordClient.on('private_message', (data) => {
      expect(data.from).toBe('tenant-user-id');
      expect(data.message).toBe(testMessage);
      expect(data.timestamp).toBeDefined();
      done();
    });
    
    // Отправляем сообщение от арендатора к арендодателю
    tenantClient.emit('private_message', {
      to: 'landlord-user-id',
      message: testMessage
    });
  });
  
  test('должен отправлять и получать уведомления между приложениями', (done) => {
    const notificationType = 'booking_request';
    const notificationContent = { bookingId: '12345' };
    
    // Настраиваем обработчик для получения уведомления
    tenantClient.on('notification', (data) => {
      expect(data.from).toBe('landlord-user-id');
      expect(data.type).toBe(notificationType);
      expect(data.content).toEqual(notificationContent);
      expect(data.timestamp).toBeDefined();
      done();
    });
    
    // Отправляем уведомление от арендодателя к арендатору
    landlordClient.emit('notification', {
      to: 'tenant-user-id',
      type: notificationType,
      content: notificationContent
    });
  });
  
  test('должен отправлять широковещательные сообщения определенному типу приложений', (done) => {
    const broadcastMessage = 'Важное сообщение для всех арендаторов';
    
    // Настраиваем обработчики для обоих клиентов
    tenantClient.on('broadcast_message', (data) => {
      expect(data.message).toBe(broadcastMessage);
      done();
    });
    
    landlordClient.on('broadcast_message', () => {
      // Этот обработчик не должен быть вызван
      fail('Landlord client should not receive tenant-specific broadcast');
    });
    
    // Отправляем широковещательное сообщение только арендаторам
    socketService.broadcastMessage(broadcastMessage, 'tenant');
  });
}); 