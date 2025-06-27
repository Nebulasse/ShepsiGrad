import { Router } from 'express';
import { AppDataSource } from '../database/connection';
import { getModuleLogger } from '../utils/logger';

const router = Router();
const logger = getModuleLogger('HealthRoutes');

// Базовая проверка работоспособности
router.get('/', async (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Расширенная проверка работоспособности с проверкой базы данных
router.get('/detailed', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    const dbStatus = { status: 'ok', latency: 0 };
    const dbStartTime = Date.now();
    
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.query('SELECT 1');
        dbStatus.latency = Date.now() - dbStartTime;
      } else {
        dbStatus.status = 'error';
      }
    } catch (error) {
      logger.error(`Ошибка при проверке подключения к базе данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      dbStatus.status = 'error';
    }

    // Собираем информацию о системе
    const systemInfo = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    };

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: dbStatus,
      system: systemInfo
    });
  } catch (error) {
    logger.error(`Ошибка при проверке работоспособности: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Ошибка при проверке работоспособности системы'
    });
  }
});

// Проверка готовности приложения к обработке запросов
router.get('/ready', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    if (!AppDataSource.isInitialized) {
      return res.status(503).json({
        status: 'error',
        message: 'База данных не инициализирована'
      });
    }

    try {
      await AppDataSource.query('SELECT 1');
    } catch (error) {
      return res.status(503).json({
        status: 'error',
        message: 'Ошибка подключения к базе данных'
      });
    }

    // Здесь можно добавить другие проверки готовности системы
    // Например, проверку подключения к Redis, S3 и т.д.

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Ошибка при проверке готовности: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Ошибка при проверке готовности системы'
    });
  }
});

// Проверка живучести приложения
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router; 